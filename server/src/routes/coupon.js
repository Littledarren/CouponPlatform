'use strict'

const User = require('../models/user')
const { cache } = require('../lib/db')
const config = require('../config')
const Coupon = require('../models/coupon')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
// 路径/src/server/lib/errors中定义了各种错误类型，其中错误类型的code属性将决定返回的状态码
const { CannotGetCouponError, InvalidUserInputError, NotFoundError, ForbiddenError, AuthorizationError } = require('../lib/errors')

const router = new Router()

const delay = ms => new Promise((resolve, reject) => {
  setTimeout(resolve, ms)
})

// 分页数量，根据接口文档设定
const PAGE_CNT = 20

/**
 * 在Model中读取记录
 * @param { Mongoose.Model } model Mongo Model
 * @param { Any } id Document Key
 * @returns { Object } Data
 */
const getAndCache = async (model, id) => {
  let result = await cache.hget(model.modelName, id)
  if (result == null) {
    result = await model.findById(id)
    if (result) {
      result = result.toCache()
      await cache.hset(model.modelName, id, result)
    }
  }
  return JSON.parse(result)
}

/**
 * 获取优惠券信息
 * @param {String} uid 用户名
 * @param {Number} page 页码，默认从1开始
 * @returns {[Coupon]} 相应的优惠券数据
 */
router.get('/users/:uid/coupons', async (ctx, next) => {
  // 从请求中获取
  const {
    // REST参数中的username
    params: { uid },
    // 页码
    query: { page = 1 },
    // Token解析出来的username
    state: { user: { sub } }
  } = ctx

  let data = []
  let user = await getAndCache(User, uid)
  // 此处根据接口文档要分两种情况
  if (user && user.kind) {
    // 尝试从cache读取优惠券数据
    await Promise.all(user.hasCoupons.slice((page - 1) * PAGE_CNT, PAGE_CNT)
      .map((cid, i) => getAndCache(Coupon, cid).then(coupon => {
        data[i] = coupon
      })))
    data = data.map(coupon => {
      coupon.name = coupon._id
      delete coupon._id
      delete coupon.username
      return coupon
    })
  } else if (uid == sub) {
    // 若用户不存在则抛出400异常
    if (!user) throw new InvalidUserInputError('用户不存在')
    // 尝试从cache读取优惠券数据
    await Promise.all(user.hasCoupons.slice((page - 1) * PAGE_CNT, PAGE_CNT)
      .map((cid, i) => getAndCache(Coupon, cid).then(coupon => {
        data[i] = coupon
      })))
    data = data.map(coupon => {
      coupon.name = coupon._id
      delete coupon._id
      delete coupon.username
      delete coupon.amount
      delete coupon.left
      return coupon
    })
  } else throw new AuthorizationError("Authorization error") // 两种情况都不满足则抛出401异常
  // 设置响应状态码
  ctx.status = data.length ? 200 : 204
  // 设置响应体
  ctx.result = { data }

  return next()
})

/**
 * 用户抢优惠券接口
 * @param {String} uid 商家用户名
 * @param {String} cid 优惠券名称
 */
router.patch('/users/:uid/coupons/:cid', async (ctx, next) => {
  // 从请求中获取
  const {
    // REST参数
    params: { uid, cid },
    // token解析出来的信息
    state: { user: { sub } }
  } = ctx

  // 首先检查用户是否已持有该优惠券，若持有则抛出204异常
  let user = await getAndCache(User, sub)
  if (user.hasCoupons.includes(cid)) throw new CannotGetCouponError('你已经拥有该优惠券了')
  // 轮询加锁
  while (!await cache.setnx(cid, sub)) await delay(300)
  // 从缓存获取数据
  let coupon = await getAndCache(Coupon, cid)
  if (!coupon || !coupon.left) {
    // 抛出异常之前要先把锁放咯
    await cache.del(cid)
    throw new CannotGetCouponError("优惠券不存在或已经被抢完了！")
  }
  --coupon.left
  // 写回cache
  await cache.pipeline().hset('Coupon', cid, JSON.stringify(coupon)).del(cid).exec()

  // 将事件添加到消息队列
  cache.publish(config.redisChannel, JSON.stringify({ customer: sub, coupon: coupon._id }))

  // 设置响应状态码
  ctx.status = 201
  // 设置响应体为空
  ctx.result = emptyResponse

  return next()
})

/**
 * 新建优惠券接口
 * @param {String} uid 创建者的用户名
 * @param {Object} body 优惠券信息
 */
router.post('/users/:uid/coupons', async (ctx, next) => {
  // 获取REST参数
  const { uid } = ctx.params
  // 获取token解析出来的用户信息
  const { sub, kind } = ctx.state.user
  // 两个用户名必须完全一致否则抛出401异常
  if (sub !== uid) throw new AuthorizationError('Authorization error');
  // 如果用户不是商家类型，则抛出400异常
  if (!kind) throw new AuthorizationError('You\'re not a saler')

  // 从请求体中解析出优惠券的信息
  const { name, amount, description, stock } = ctx.request.body
  // 数据验证
  if (!name || !amount || !stock 
    || Number.isNaN(+amount) || Number.isNaN(+stock)
    || +amount <= 0 || +stock <= 0) throw new InvalidUserInputError('Invalid input data')
  // 重复验证
  if (await Coupon.findById(name)) throw new InvalidUserInputError('Coupon name has been occupied')

  // 新建优惠券
  await new Coupon({
    _id: name,
    username: uid,
    amount,
    left: amount,
    description,
    stock
  }).save()
  // 更新商家信息
  const user = await User.findByIdAndUpdate(uid, { $push: { hasCoupons: [name] } }, { new: true })
  // 同步更新缓存
  await cache.hset('User', uid, user.toCache())

  // 设置响应状态码
  ctx.status = 201
  // 设置响应体为空
  ctx.result = emptyResponse

  return next()
})

module.exports = router