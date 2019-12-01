'use strict'

const db = require('../lib/db').default
const { Schema } = require('mongoose')

const schema = new Schema({
    username: {
        type: String,
        required: true,
        indexes: true
    },
    coupons: {
        type: String,
        required: true
    },
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
    },
    created: {
        type: Date,
        default: () => new Date
    }
})

schema.set('toJSON', { versionKey: false })
schema.set('toObject', { versionKey: false })

module.exports = db.model('Coupon', schema)