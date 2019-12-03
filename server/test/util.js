'use strict'

const users = require('./data/user')
const config = require('../src/config')

const req = require('request-promise').defaults({
  baseUrl: `http://localhost:${config.port}/api`,
  json: true,
  resolveWithFullResponse: true
})

module.exports = {
  req,
  reqBy (uid) {
    const user = users.filter(user => user._id === uid)[0]
    return req.defaults({
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
  }
}