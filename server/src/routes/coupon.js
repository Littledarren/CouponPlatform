'use strict'

const User = require('../models/user')
const config = require('../config')
const Coupon = require('../models/coupon')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
const { InvalidUserInputError, NotFoundError, ForbiddenError, AuthorizationError } = require('../lib/errors')

const router = new Router()

const PAGE_CNT = 20

router.get('/users/:uid/coupons', async (ctx, next) => {
  const {
    // 用户id
    params: { uid },
    // 页码
    query: { page = 1 },
    // 用户id
    state: { user }
  } = ctx

  // 返回该用户/商家自己剩余的优惠券信息
  if ((await User.findById(uid)).kind) {
    ctx.result = await Coupon.find({ username: uid }).skip((page - 1) * PAGE_CNT).limit(PAGE_CNT) || []
  } else if (uid == user.sub) {
    const user = await User.findById(uid)
    if (user) {
      ctx.result = await Coupon.find({ coupons: { $in: user.hasCoupons } })
        .skip((page - 1) * PAGE_CNT)
        .limit(PAGE_CNT)

      ctx.result = ctx.result.map(coupon => {
        coupon.username = uid
        coupon.amount = 1
        coupon.left = 1
        delete coupon.created
        return coupon
      })
    } else throw new ForbiddenError('用户不存在')
  } else throw new AuthorizationError("Authorization error")

  return next()
})

// 获取优惠券
router.patch('/users/:uid/coupons/:cid', async (ctx, next) => {
  const {
    params: { uid, cid },
    state: { user }
  } = ctx

  // if (await Coupon.findOne({ username: user.sub, coupons: cid })) throw new InvalidUserInputError("你已经拥有了该优惠券")
  if (await User.findOne({ _id: user.sub, hasCoupons: { $elemMatch: { $eq: cid } } }))
    throw new InvalidUserInputError('你已经拥有该优惠券了')

  const coupon = await Coupon.findOneAndUpdate({ coupons: cid, amount: { $gt: 0 } }, { $inc: { amount: -1 } })
  if (!coupon) throw new NotFoundError("优惠券不存在或优惠券已经被抢光了")
/*
  await new Coupon({
    username: user.sub,
    coupons: coupon.coupons,
    amount: 1,
    left: 1,
    description: coupon.description,
    stock: coupon.stock
  }).save()
*/
  await User.findByIdAndUpdate(user.sub, { $push: { hasCoupons: coupon.coupons } })

  ctx.result = emptyResponse

  return next()
})

// 新建优惠券
router.post('/users/:uid/coupons', async (ctx, next) => {
  const { uid } = ctx.params
  const { sub, kind } = ctx.state.user
  if (sub !== uid) throw new AuthorizationError('Authorization error');
  if (!kind) throw new AuthorizationError('You\'re not a saler')

  const { name, amount, description, stock } = ctx.request.body

  await new Coupon({
    username: uid,
    coupons: name,
    amount,
    left: amount,
    description,
    stock
  }).save()

  ctx.result = emptyResponse

  return next()
})

module.exports = router