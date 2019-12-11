'use strict'

const User = require('../models/user')
const config = require('../config')
const Coupon = require('../models/coupon')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
const { CannotGetCouponError, InvalidUserInputError, NotFoundError, ForbiddenError, AuthorizationError } = require('../lib/errors')

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

  let data
  if ((await User.findById(uid)).kind) {
    // 返回商家剩余的优惠券信息
    data = await Coupon.find({ username: uid }).skip((page - 1) * PAGE_CNT).limit(PAGE_CNT) || []
  } else if (uid == user.sub) {
    // 返回用户剩余的优惠券信息
    const user = await User.findById(uid)
    if (!user) throw new InvalidUserInputError('用户不存在')
    data = (await Coupon.find({ coupons: { $in: user.hasCoupons } })
      .skip((page - 1) * PAGE_CNT)
      .limit(PAGE_CNT))
      .map(coupon => {
        coupon.username = uid
        coupon.amount = 1
        coupon.left = 1
        return coupon
      })
  } else throw new AuthorizationError("Authorization error")

  ctx.status = 200
  if (!data.length) ctx.status = 204
  ctx.result = { data }

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
    throw new CannotGetCouponError('你已经拥有该优惠券了')

  const coupon = await Coupon.findOneAndUpdate({ coupons: cid, left: { $gt: 0 } }, { $inc: { left: -1 } })
  if (!coupon) throw new CannotGetCouponError("优惠券不存在或优惠券已经被抢光了")

  await User.findByIdAndUpdate(user.sub, { $push: { hasCoupons: coupon.coupons } })
  ctx.status = 201
  ctx.result = emptyResponse

  return next()
})

// 新建优惠券
router.post('/users/:uid/coupons', async (ctx, next) => {
  const { uid } = ctx.params
  const { sub, kind } = ctx.state.user
  if (sub !== uid) throw new AuthorizationError('Authorization error');
  if (!kind) throw new InvalidUserInputError('You\'re not a saler')

  const { name, amount, description, stock } = ctx.request.body

  await new Coupon({
    username: uid,
    coupons: name,
    amount,
    left: amount,
    description,
    stock
  }).save()

  ctx.status = 201
  ctx.result = emptyResponse

  return next()
})

module.exports = router