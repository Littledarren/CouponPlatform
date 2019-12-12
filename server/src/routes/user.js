'use strict'

const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { md5 } = require('../lib/util')
const config = require('../config')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
// 路径/src/server/lib/errors中定义了各种错误类型，其中错误类型的code属性将决定返回的状态码
const { AuthorizationError } = require('../lib/errors')

const router = new Router()

/**
 * 用户注册接口
 * @param {{ username: String, password: String, kind: String }} body 用户名密码和类型
 * @param {String} kind 用户类型，必须是'saler'和'customer'其中之一
 */
router.post('/users', async (ctx, next) => {
  // 从请求体中获取用户名、密码和用户类型
  const { username, password, kind } = ctx.request.body
  // 用户类型必须是'saler'或者'customer'，否则抛出400异常
  if (kind !== 'saler' && kind !== 'customer') 
    throw new InvalidUserInputError('Kind field must be \'customer\' or \'saler\'')
  // 检查数据库确认用户名是否已被使用，若被使用则抛出400异常
  if (await User.findById(username)) throw new InvalidUserInputError('用户名已被占用')
  // 写入数据库
  await new User({ _id: username, kind: (kind === 'saler' ? 1 : 0) , password: md5(password) }).save()
  // 设置响应状态码
  ctx.status = 201
  // 设置响应体为空
  ctx.result = emptyResponse
  return next()
})

/**
 * 用户登录接口
 * @param {{ username: String, password: String }} body 用户名和密码
 * @returns {String} header['authorization']包含关联用户的token，有效期一小时
 */
router.post('/auth', async (ctx, next) => {
  // 从请求体中获取用户名和密码
  const { username, password } = ctx.request.body
  // 从数据库中匹配
  const result = await User.findOne({ _id: username, password: md5(password) })
  // 若没有记录，则抛出401异常
  if (!result) throw new AuthorizationError('Authorization error')
  // 生成jsonwebtoken并添加到HTTP响应头
  ctx.append('Authorization', `Bearer ${jwt.sign({ sub: result._id, kind: result.kind }, config.secret, { expiresIn: '1 hours' })}`)
  // 设置响应状态码
  ctx.status = 200
  // 根据接口要求设置返回用户的类型
  ctx.result = { kind: result.kind ? 'saler' : 'customer' }

  return next()
})

module.exports = router