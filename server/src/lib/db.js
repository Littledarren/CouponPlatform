'use strict'

const config = require('../config')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const redis = new Redis(config.redisPort, config.redisAddr)

// 清除缓存
redis.flushall()

// mongoose 要求替换内置的 Promise
mongoose.Promise = global.Promise

mongoose.set('useFindAndModify', false)

const conn = mongoose.createConnection(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // 建议连接池大小 = (核心数 * 2 + 有效磁盘数)
  poolSize: 3
})

// 连接默认数据库
const defaultDB = conn.useDb(config.base)

module.exports = {
  default: defaultDB,
  cache: redis
}
