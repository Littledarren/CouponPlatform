'use strict'

const { req, reqBy } = require('../util')

const delay = ms => new Promise((resolve, reject) => { setTimeout(resolve, ms) })

describe('优惠券', function () {
  it('商家可以创建优惠券', async function () {
    const userReq = reqBy('jiangzihao0')
    const result1 = await userReq.post('users/jiangzihao0/coupons', { body: {
      name: 'test1',
      amount: 10000,
      description: 'hi',
      stock: 10000
    }})

    result1.statusCode.should.be.eql(201, '创建成功')

    const result = (await reqBy('jiangzihao0')('users/jiangzihao0/coupons')).body
    result.data[0].name.should.be.eql('test1', '信息获取成功')
  })

  it('商家不可以创建重复的优惠券', async function () {
    const userReq = reqBy('jiangzihao0')
    const result1 = await userReq.post('users/jiangzihao0/coupons', { body: {
      name: 'test1',
      amount: 10000,
      description: 'hi',
      stock: 10000
    }}).catch(err => {
      err.statusCode.should.be.eql(400, '创建失败')
    })
  })

  it('用户不可以创建优惠券', async () => {
    const userReq = reqBy('jzh123s0')
    await userReq.post('users/jzh123s0/coupons', { body: {
      name: 'test2',
      amount: 10000,
      description: 'hi',
      stock: 10000
    }}).catch(err => {
      err.statusCode.should.be.eql(401, '创建失败')
    })

    await userReq.post('users/jiangzihao0/coupons', { body: {
      name: 'test3',
      amount: 10001,
      description: 'hi',
      stock: 2000
    }}).catch(err => {
      err.statusCode.should.be.eql(401, '创建失败')
    })
  })

  it('用户获取优惠券', async function () {
    const userReq = reqBy('jzh123s0')
    const result1 = await userReq.patch('users/jiangzihao0/coupons/test1')
    result1.statusCode.should.be.eql(201, '获取成功')
    // 延时确保数据写入
    await delay(5000)
    const result2 = (await userReq('users/jzh123s0/coupons'))
    result2.body.data.length.should.be.eql(1, '信息获取成功')
  })

  it('用户获取优惠券信息空页时应返回204状态码', async () => {
    const userReq = reqBy('jzh123s0')
    const result = await userReq('users/jzh123s0/coupons?page=100')
    result.statusCode.should.be.eql(204)
  })

  it('用户不能获取同一种优惠券两次', async () => {
    const userReq = reqBy('jzh123s0')
    const result = await userReq.patch('users/jiangzihao0/coupons/test1')
      .catch(err => err.statusCode.should.be.eql(204, '获取失败'))
  })
})