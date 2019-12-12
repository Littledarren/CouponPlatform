'use strict'

const User = require('../models/user')
const config = require('../config')
const Coupon = require('../models/coupon')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
// 路径/src/server/lib/errors中定义了各种错误类型，其中错误类型的code属性将决定返回的状态码
const { CannotGetCouponError, InvalidUserInputError, NotFoundError, ForbiddenError, AuthorizationError } = require('../lib/errors')

const router = new Router()

// 分页数量，根据接口文档设定
const PAGE_CNT = 20

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

  let data
  // 此处根据接口文档要分两种情况
  if ((await User.findById(uid)).kind) {
    // 若url指定的用户名身份为商家，则获取该商家的优惠券余量，同时做好分页
    data = (await Coupon.find({ username: uid }).skip((page - 1) * PAGE_CNT).limit(PAGE_CNT) || [])
      .map(coupon => {
        delete coupon._id
        delete coupon.username
        return coupon
      })
  } else if (uid == sub) {
    // 否则url指定的用户名必须等于token解析获得的用户名
    const user = await User.findById(uid)
    // 若用户不存在则抛出400异常
    if (!user) throw new InvalidUserInputError('用户不存在')
    // 否则查找满足优惠券名称为用户的hasCoupons字段中的元素的记录，同时做好分页
    data = (await Coupon.find({ name: { $in: user.hasCoupons } })
      .skip((page - 1) * PAGE_CNT)
      .limit(PAGE_CNT))
      .map(coupon => { // 由于获取出来的是商家的信息，要进行一定的修改，屏蔽一些字段
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
  if (await User.findOne({ _id: sub, hasCoupons: { $elemMatch: { $eq: cid } } }))
    throw new CannotGetCouponError('你已经拥有该优惠券了')
  // 否则去更新该优惠券，在查询条件中需要设置优惠券的left字段要满足大于0，然后对left进行减1的更新操作
  const coupon = await Coupon.findOneAndUpdate({ name: cid, left: { $gt: 0 } }, { $inc: { left: -1 } })
  // 若上一步没有更新到任何数据，则说明优惠券不存在或者已经被抢光了，抛出204异常
  if (!coupon) throw new CannotGetCouponError("优惠券不存在或优惠券已经被抢光了")
  // 在用户的hasCoupons字段中添加该优惠券的名称
  await User.findByIdAndUpdate(sub, { $push: { hasCoupons: coupon.name } })
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
  if (await Coupon.findOne({ name })) throw new InvalidUserInputError('Coupon name has been occupied')

  // 新建优惠券
  await new Coupon({
    username: uid,
    name,
    amount,
    left: amount,
    description,
    stock
  }).save()

  // 设置响应状态码
  ctx.status = 201
  // 设置响应体为空
  ctx.result = emptyResponse

  return next()
})

module.exports = router