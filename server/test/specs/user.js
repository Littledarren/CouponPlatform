'use strict'

require('should')

const config = require('../../src/config')
const { req, reqBy } = require('../util')

describe('用户', () => {
  it('用户注册并登录', async () => {
    const result = await req.post(`/users`, {
      body: {
        username: 'test1',
        password: '123456',
        kind: 'saler'
      }
    })

    ;(await req.post(`/auth`, { body: { username: 'test1', password: '123456' } })).kind.should.be.eql('saler', '成功注册')
  })
})