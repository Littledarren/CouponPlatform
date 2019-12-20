'use strict'

const jwt = require('jsonwebtoken')
const config = require('../../src/config')

const customers = []
const salers = []

for (let i = 0; i < 10; ++i) {
  salers.push({
    _id: `jiangzihao${i}`,
    password: '82415768',
    kind: 1
  })
}

salers[1].hasCoupons = ['来抢啊啊啊啊啊']

for (let i = 0; i < 1000; ++i) {
  customers.push({
    _id: `jzh123s${i}`,
    password: '82415768',
    kind: 0
  })
}

module.exports = [
  ...salers,
  ...customers
].map(user => {
  user.token = jwt.sign({ sub: user._id, kind: user.kind }, config.secret)
  return user
})