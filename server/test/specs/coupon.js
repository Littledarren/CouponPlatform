'use strict'

const { req, reqBy } = require('../util')

describe('优惠券', function () {
  it('商家可以创建优惠券', async function () {
    const userReq = reqBy('jiangzihao0')
    await userReq.post('users/jiangzihao0/coupons', { body: {
      name: 'test1',
      amount: 10000,
      description: 'hi',
      stock: 10000
    }})

    const result = (await reqBy('jiangzihao0')('users/jiangzihao0/coupons'))
    result[0].coupons.should.be.eql('test1', '创建成功')
  })

  it('用户不可以创建优惠券', async () => {
    const userReq = reqBy('jzh123s0')
    const result = await userReq.post('users/jzh123s0/coupons', { body: {
      name: 'test2',
      amount: 10000,
      description: 'hi',
      stock: 10000
    }})

    result.errMsg.should.not.be.eql(undefined, '创建失败')
  })

  it('用户获取优惠券', async () => {
    const userReq = reqBy('jzh123s0')
    await userReq.patch('users/jiangzihao0/coupons/test1')

    const result = (await userReq('users/jzh123s0/coupons'))
    result.length.should.be.eql(1, '获取成功')
  })

  it('用户不能获取同一种优惠券两次', async () => {
    const userReq = reqBy('jzh123s0')
    const result = await userReq.patch('users/jiangzihao0/coupons/test1')
    result.errMsg.should.not.be.eql(undefined, '获取失败')
  })
})