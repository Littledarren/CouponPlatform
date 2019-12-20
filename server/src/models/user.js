'use strict'

const db = require('../lib/db').default
const { Schema } = require('mongoose')

const schema = new Schema({
    _id: String,
    kind: Number,
    password: String,
    hasCoupons: {
        type: [String],
        default: []
    }
})

schema.set('toJSON', { versionKey: false })
schema.set('toObject', { versionKey: false })

schema.methods.toCache = function () {
    return JSON.stringify({ _id: this._id, hasCoupons: this.hasCoupons, kind: this.kind })
}

module.exports = db.model('User', schema)