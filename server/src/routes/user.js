'use strict'

const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { md5 } = require('../lib/util')
const config = require('../config')
const Router = require('koa-router')
const { emptyResponse } = require('../lib/response')
const { AuthorizationError } = require('../lib/errors')

const router = new Router()

router.post('/users', async (ctx, next) => {
  const { username, kind, password } = ctx.request.body

  if (kind !== 'saler' && kind !== 'customer') 
    throw new InvalidUserInputError('Kind field must be \'customer\' or \'saler\'')

  await new User({ _id: username, kind: (kind === 'saler' ? 1 : 0) , password: md5(password) }).save()

  ctx.result = emptyResponse
  return next()
})

router.post('/auth', async (ctx, next) => {
  const { username, password } = ctx.request.body

  const result = await User.findOne({ _id: username, password: md5(password) })

  if (result != null) {
    // 添加token到响应头
    ctx.append('Authorization', `Bearer ${jwt.sign({ sub: result._id, kind: result.kind }, config.secret, { expiresIn: '1 hours' })}`)
    ctx.result = { kind: result.kind ? 'saler' : 'customer' }
  } else throw new AuthorizationError('Authorization error')

  return next()
})

module.exports = router