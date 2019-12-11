'use strict'

const fs = require('fs')
const jwt = require('koa-jwt')
const config = require('../config')
const Router = require('koa-router')
const router = new Router()

/**
 * JWT认证中间件，用户必须在请求头的Authorization字段携带正确的token
 * 用户注册和登录的接口不需要认证
 */
router.use(jwt({ secret: config.secret }).unless({
  path: [
    /^\/api\/auth$/,
    /^\/api\/users$/
  ]
}))


// 读取所有路由（除了index.js），并注册这些路由
const routes = fs.readdirSync(__dirname).filter(route => route !== 'index.js')
for (const route of routes) {
  if (route.toLowerCase().endsWith('.js')) {
    const externalRouter = require(`./${route}`)
    if (externalRouter instanceof Router) {
      router.use(externalRouter.routes())
    }
  }
}

module.exports = router
