'use strict'

const jwt = require('jsonwebtoken')
const config = require('../../src/config')

const customers = []
const salers = []

for (let i = 0; i < 10; ++i) {
  salers.push({
    _id: `jiangzihao${i}`,
    password: '82415768',
    kind: 'saler'
  })
}

for (let i = 0; i < 1000; ++i) {
  customers.push({
    _id: `jzh123s${i}`,
    password: '82415768',
    kind: 'customer'
  })
}

module.exports = [
  ...salers,
  ...customers
].map(user => {
  user.token = jwt.sign({ sub: user._id, kind: user.kind }, config.secret)
  return user
})