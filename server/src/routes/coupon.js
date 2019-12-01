'use strict'

const User = require('../models/user')
const config = require('../config')
const Coupon = require('../models/coupon')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
const { InvalidUserInputError, NotFoundError, ForbiddenError } = require('../lib/errors')

const router = new Router()

const PAGE_CNT = 20

router.get('/users/:uid/coupons', async (ctx, next) => {
  const {
    // 商家id
    params: { uid },
    // 页码
    query: { page = 0 },
    // 用户id
    state: { user }
  } = ctx

  // 返回该用户/商家自己剩余的优惠券信息
  if (uid == user.sub || (await User.findById(uid)).kind === 'saler') {
    ctx.result = await Coupon.find({ username: uid }).skip(page * PAGE_CNT).limit(PAGE_CNT) || []
  } else throw new ForbiddenError("Authorization error")

  return next()
})

// 获取优惠券
router.patch('/users/:uid/coupons/:cid', async (ctx, next) => {
  const {
    params: { uid, cid },
    state: { user }
  } = ctx

  if (await Coupon.findOne({ username: user.sub, coupons: cid })) throw new InvalidUserInputError("你已经拥有了该优惠券")

  const coupon = await Coupon.findOneAndUpdate({ coupons: cid, amount: { $gt: 0 } }, { $inc: { amount: -1 } })
  if (!coupon) throw new NotFoundError("优惠券不存在或优惠券已经被抢光了")

  await new Coupon({
    username: user.sub,
    coupons: coupon.coupons,
    amount: 1,
    left: 1,
    description: coupon.description,
    stock: coupon.stock
  }).save()

  ctx.result = emptyResponse

  return next()
})

// 新建优惠券
router.post('/users/:uid/coupons', async (ctx, next) => {
  const { uid } = ctx.params
  if (ctx.state.user.sub != uid) throw new ForbiddenError('Authorization error');

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