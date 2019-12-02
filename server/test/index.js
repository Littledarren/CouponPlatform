'use strict'

const config = require('../src/config')
config.base = 'coupon-test'
config.port = 3011
process.env.NODE_ENV = 'test'

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

// 清空数据库

;(async () => {
  await mongoose.createConnection(config.db, { useNewUrlParser: true, useUnifiedTopology: true }).useDb(config.base).dropDatabase()
})()


require('../src/lib/db')

describe('coupon-platform', function () {
  this.timeout(0)

  before('导入测试数据', async function () {
    const mockdata = path.resolve(__dirname, 'data')
    const entries = fs.readdirSync(mockdata)
    for (const entry of entries) {
      if (/\.js$/.test(entry)) {
        const data = require(path.resolve(mockdata, entry))
        const Model = require(`../src/models/${entry.split('.')[0]}`)

        for (const item of data) {
          await new Model(item).save()
        }
      }
    }
  })

  before('启动服务器', function () {
    const app = require('../src/app')
    const http = require('http')
    const server = http.createServer(app.callback())

    server.listen(+config.port)

    return new Promise((resolve, reject) => resolve())
  })

  // describe('执行所有测试', () => {
  const specs = fs.readdirSync(path.resolve(__dirname, 'specs'))
  specs.forEach(spec => {
    if (/\.js$/.test(spec)) {
      require(path.resolve(__dirname, 'specs', spec))
    }
  })
  // })  

  after('清空数据库', function () {
    return require('../src/lib/db').default.dropDatabase()
  })
}) 