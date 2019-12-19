'use strict'

const { cache } = require('./lib/db')
const Redis = require('ioredis')
const config = require('./config')
const User = require('./models/user')
const Coupon = require('./models/coupon')

const redis = new Redis(config.redisPort, config.redisAddr)

// 订阅消息
redis.subscribe(config.redisChannel)

let queue = []
const QUEUE_MAX_LENGTH = 200
const RESOLVE_CYCLE = 1000

redis.on('message', (channel, message) => {
  addTask(JSON.parse(message))
})

// 添加任务到消息队列
const addTask = task => {
  queue.push(task)
  if (queue.length >= QUEUE_MAX_LENGTH) {
    resolve()
  }
}

// 对消息队列中的任务进行处理
const resolve = async () => {
  if (!queue.length) return
  const resolveQueue = queue
  queue = []

  const merged = resolveQueue.reduce((list, currentTask) => {
    const { coupon, customer } = currentTask
    if (list[coupon]) {
      list[coupon].push(customer)
    } else {
      list[coupon] = [ customer ]
    }
    return list
  }, {})

  // 并发持久化数据，并更新缓存
  return Promise.all(Object.keys(merged).map(coupon => new Promise(async (resolve, reject) => {
    // 更新优惠券数量
    await Coupon.findByIdAndUpdate(coupon, { $inc: { left: merged[coupon].length } })
    // 更新用户数据
    await User.updateMany({ _id: { $in: merged[coupon] } }, { $push: { hasCoupons: [coupon] } }, { new: true })
    const users = await User.find({ _id: { $in: merged[coupon] } })
    for (const user of users) {
      await cache.hset('User', user._id, JSON.stringify(user))
    }
    resolve()
  })))
}

setInterval(resolve, RESOLVE_CYCLE)

