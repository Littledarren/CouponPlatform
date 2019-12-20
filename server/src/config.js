'use strict'

const path = require('path')

module.exports = {
  db: 'mongodb://localhost/',
  log: path.resolve(__dirname, '../logs/coupon.log'),
  base: 'coupon',
  port: '3000',
  root: '',
  secret: 'coupon',
  redisPort: 6379,
  redisAddr: '127.0.0.1',
  redisChannel: 'mq',
  // 消息队列配置
  messageQueueOptions: {
    maxLength: 200,
    resolveCycle: 3000
  }
}
