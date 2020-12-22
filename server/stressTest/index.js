'use strict'

const fs = require('fs')
const ProgressBar = require('progress')
const { signIn, signUp, getCoupon, getCouponInfo, createCoupon, batchRegister } = require('./api')

const delay = ms => new Promise((resolve, reject) => { setTimeout(resolve, ms) })

async function main () {
    if (!fs.existsSync('users.json')) {
        // 支持从200到6200的并发量
        // await batchRegister('ljl', 99200, 'customer')
	    await batchRegister('ljl', 42000, 'customer') 
    }
        
    const users = require('./users.json')
    
    let saler = { username: 'jzh', password: '123456', kind: 'saler' }
    await signUp(saler).catch(console.error)
    saler = await signIn(saler)

    let couponBaseName = 'test'
    let couponCnt = 10
    let amount = 10000

    for (let i = 0; i < couponCnt; ++i) {
        await createCoupon(saler, {
            name: `${couponBaseName}${i}`,
            amount,
            description: 'nothing special',
            stock:100
        })
    }
    
    let start = 0
    let step = 200
    console.log('开始测试')
    while (start < users.length) {
        const target_user = users.slice(start, start + step)
        const time = Array.from({ length: target_user.length })
        let err_cnt = 0
        const bar = new ProgressBar('进度[:bar] :rate/rps :percent', {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: step
        })
        const couponLeft = (await getCouponInfo(saler, saler.username)).map(coupon => coupon.left)
        let succ_cnt = Array.from({ length: couponLeft.length }, () => 0)
        await Promise.all(target_user.map((user, i) => {
            return new Promise(async (resolve, reject) => {
                const couponIndex = Math.floor(Math.random() * couponCnt)
                let rand_try = Math.floor(Math.random() * 10)
                const start_time = new Date()
                try {
                    // 1. 登录
                    user = (await signIn(user))
                    // 2. 获取若干次优惠券信息
                    while (rand_try--) await getCouponInfo(user, saler.username)
                    // 3. 获取优惠券
                    const req = await getCoupon(user, saler.username, `${couponBaseName}${couponIndex}`)
                    if (req.status === 201) ++succ_cnt[couponIndex]
                    // 4. 再次获取优惠券信息
                    await getCouponInfo(user, user.username)
                } catch (err) {
                    console.log(err.stack)
                    ++err_cnt
                }
                time[i] = new Date() - start_time
                bar.tick()
                resolve()
            })
        })).then(async () => {
            const average = Math.floor(time.reduce((a, b) => a + b) / step)
            const min = Math.min(...time)
            const max = Math.max(...time)
            const nowLeft = (await getCouponInfo(saler, saler.username)).map(coupon => coupon.left)
            console.log(`并发量: ${step}, 用户平均响应时间: ${average}, 最小响应时间: ${min}, 最长响应时间: ${max}, 错误计数: ${err_cnt}`)
            const succ_cnt_total = succ_cnt.reduce((a, b) => a+b)
            for (let i = 0; i < couponCnt; ++i) {
                if (couponLeft[i] - nowLeft[i] !== succ_cnt[i]) {
                    console.log(`优惠券[${couponBaseName}${i}]减少: ${couponLeft[i]}, ${nowLeft[i]}, 成功获取优惠券人数: ${succ_cnt[i]}`)
                }
            }
            console.log(`总计成功发放 ${succ_cnt_total}张优惠券`)
        }).then(() => { 
            const ms = 10000
            console.log(`等待${ms}ms完成持久化`)
            console.log()
            return delay(ms)
        })

        start += step
        step += 200
    }
}

main()
