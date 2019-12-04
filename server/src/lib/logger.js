'use strict'

const fs = require('fs')
const path = require('path')
const config = require('../config')
const log4js = require('log4js')

// 判断日志文件夹是否存在，不存在则创建
const logsDir = path.parse(config.log).dir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

// 配置 log4js
log4js.configure({
  appenders: {
    console: { type: 'console' },
    dateFile: { type: 'dateFile', filename: config.log, pattern: '-yyyy-MM-dd' }
  },

  categories: {
    default: { appenders: ['console', 'dateFile'], level: 'info' }
  }
})

const logger = log4js.getLogger('default')

// 用于记录所有 HTTP 请求的 Middleware
const loggerMiddleware = async (ctx, next) => {
  const start = new Date()
  await next()

  const ms = new Date() - start
  const remoteAddress = ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
    (ctx.socket && (ctx.socket.remoteAddress || (ctx.socket.socket && ctx.socket.socket.remoteAddress)))

  // logger.info(`${ctx.method.padStart(6)} ${ctx.status} ${ctx.url} - ${remoteAddress} - ${ms}ms`)
}

module.exports = {
  logger,
  loggerMiddleware
}
