'use strict'

const fs = require('fs')

const { signIn, signUp, getCoupon, getCouponInfo, createCoupon, batchRegister } = require('./api')

var saler = {
    username:'jzh',
    password:'123456',
    kind:'saler'
}

async function main () {
    if (!fs.existsSync('users.json')) {
        await batchRegister('ljl', 21000, 'customer', 600)
    }
        
    const users = require('./users.json')
    await signUp(saler).catch(console.error)
    saler = await signIn(saler)

    let couponName = 'testh'
    let amount = 30000

    await createCoupon(saler, {
        name: couponName,
        amount,
        description: 'nothing special',
        stock:100
    })
    
    let start = 0
    let step = 200

    while (start < users.length) {
        // await getCouponInfo(saler, saler.username).then(data=>console.log(JSON.stringify(data, null, 2)));    
        const time_average = Array.from({ length: step })
        await Promise.all(users.slice(start, start + step).map((user, i) => {
            return new Promise(async (resolve, reject) => {
                const start_time = new Date()
                try {
                    user = (await signIn(user))
                    await getCoupon(user, saler.username, couponName)
                    // const coupons = await getCouponInfo(user, user.username)
                    // const salerCoupons = await getCouponInfo(user, saler.username)
                } catch (err) {
                    console.error(err)
                }
                time_average[i] = new Date() - start_time
                resolve()
            })
        })).then(() => {
            console.log(`步长: ${step}, 用户平均响应时间: ${time_average.reduce((a, b) => a + b) / step}`)
            // getCouponInfo(saler, saler.username).then(data=>console.log(JSON.stringify(data, null, 2)));
        })

        start += step
        step += 200
    }
    

    
    
    //await getCoupon(users,'lanjialu','jzh','双12');
   // await getCouponInfo(users,'lanjialu','jzh').then(data=>console.log(JSON.stringify(data, null, 2)));
}

main()
