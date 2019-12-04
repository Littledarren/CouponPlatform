'use strict'

const Koa = require('koa')
const path = require('path')
const config = require('./config')
// const rewrite = require('koa-rewrite')
// const fallback = require('./lib/middlewares/fallback')
// const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const { loggerMiddleware } = require('./lib/logger')
const { responseHandler, errorHandler } = require('./lib/response')

const app = new Koa()
const router = require('./routes').prefix('/api')

require('http').globalAgent.maxSockets = Infinity

// 先require一次db来连接数据库
require('./lib/db')

if (process.env.NODE_ENV !== 'test') app.use(loggerMiddleware)
app.use(errorHandler)
app.use(bodyParser())
// app.use(rewrite(`/${config.base}/`, '/$1'))
app.use(router.routes())
// app.use(fallback())
// app.use(koaStatic(path.resolve(__dirname, './public')))
app.use(responseHandler)

module.exports = app
