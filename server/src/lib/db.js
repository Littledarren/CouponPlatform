'use strict'

const config = require('../config')
const mongoose = require('mongoose')

// mongoose 要求替换内置的 Promise
mongoose.Promise = global.Promise

const conn = mongoose.createConnection(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true
})

// 连接默认数据库
const defaultDB = conn.useDb(config.base)

module.exports = {
  default: defaultDB
}
