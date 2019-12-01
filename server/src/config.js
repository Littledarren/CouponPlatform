'use strict'

const path = require('path')

module.exports = {
  db: 'mongodb://localhost/',
  log: path.resolve(__dirname, '../logs/coupon.log'),
  base: 'coupon',
  port: '3000',
  root: '',
  secret: 'coupon'
}
