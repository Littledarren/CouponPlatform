'use strict'

const db = require('../lib/db').default
const { Schema } = require('mongoose')

const schema = new Schema({
  _id: String,
  username: {
    type: String,
    required: true
  },
  /*
  name: {
    type: String,
    unique: true,
    required: true
  },*/
  amount: {
    type: Number,
    default: 1
  },
  left: {
    type: Number,
    default: 1
  },
  description: String,
  stock: {
    type: Number,
    required: true
  }
})

schema.set('toJSON', { versionKey: false })
schema.set('toObject', { versionKey: false })

module.exports = db.model('Coupon', schema)