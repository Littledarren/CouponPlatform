const axios = require('axios');

const config = require('../src/config')
// For test
config.root = '127.0.0.1'

const baseURL = `http://${config.root}:${config.port}/api/`;

const req = axios.create({ 
    baseURL, 
    validateStatus: status => status >= 200 && status < 500, 
    timeout: 20000 
})

const reqBy = user => {
    return axios.create({
        baseURL,
        headers: { authorization: user.auth },
        validateStatus: status => status >= 200 && status < 500,
        timeout: 20000
    })
}

const signUp = ({ username, password, kind }) => req.post(`users`, { username, password, kind })

const signIn = async user => {
    const { username, password } = user
    const result = await req.post(`auth`, { username, password })
    return Object.assign(user, {
        kind: result.data.kind, //信息在data字段里
        auth: result.headers.authorization //auth在headers字段里
    })
}

function createCoupon (user, { name, amount, description, stock }) {
    return reqBy(user).post(`users/${user.username}/coupons`, { name, amount, description, stock })
}

async function getCouponInfo(user, username) {
    let page = 1
    let data = []
    // 把每一页的结果都请求了
    do {
        var result = await reqBy(user)(`users/${username}/coupons?page=${page}`)
        data.concat(result.data);
        ++page;
    // 如果请求的结果数量等于20，说明可能还有下一页
    } while (result.data.length == 20)
    return data;
}

function getCoupon(user, username, name){
    return reqBy(user).patch(`users/${username}/coupons/${encodeURIComponent(name)}`)
}

async function batchRegister(baseName, number, kind, concurrence = 200) {
    const result = []
    const users = Array.from({ length: number }).map((user, index) => ({
        username: `${baseName}${index}`,
        password: '123456',
        kind
    }))

    await Promise.all(Array.from({ length: concurrence }).map(t => {
        return new Promise(async (resolve, reject) => {
            while (users.length) {
                const user = users.shift()
                await signUp(user).then(() => {
                    console.log(`user ${user.username} is registered.`)
                    result.push(user)
                }).catch(err => console.error(err.stack))
            }
            resolve()
        })
    }))

    require('fs').writeFileSync('users.json', JSON.stringify(result), 'utf8')
    return result
}

module.exports = {
    signIn,
    signUp,
    getCouponInfo,
    getCoupon,
    createCoupon,
    batchRegister,
    req,
    reqBy
};