// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

const isDev = false
const DEV_BASE_URL = 'http://localhost:3000/client/api'
const PROD_BASE_URL = 'http://xlxlx.xyz:3000/client/api'

const BASE_URL = isDev ? DEV_BASE_URL : PROD_BASE_URL
// cloud-dev-0f318b cloud-prod-yg88k
cloud.init({
  env: process.env.cloudName
})

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    if (event.name === 'races') {
      const data = await db.collection('races').where({}).get()

      const ret = data.data.map(el => {
        const { name, ethnicPattern, ethnicIcon, skills } = el
        return { name, ethnicPattern, ethnicIcon, skills }
      })
      return { ...data, data: ret }
    }

    if (event.name === 'heroes') {
      const data = await db.collection('heroes').where({}).get()
      const ret = data.data.map(el => {
        const { name, miniIcon, icon, cardQuality, category, cardType } = el
        return { name, miniIcon, icon, cardQuality, category, cardType }
      })

      return { ...data, data: ret }
    }

    if (event.name === 'careers') {
      const data = await db.collection('careers').where({}).get()
      return data
    }

    if (event.name === 'qualities') {
      const data = await db.collection('qualities').where({}).get()
      return data
    }

    if (event.name === 'getHeroById') {
      const data = await db.collection('heroes').doc(event._id).get()
      return data
    }

    // 来源
    if (event.name === 'getSources') {
      const res = await axios.get(BASE_URL + '/source/list')
      return {data: res.data}
    }

    if (event.name === 'strategy') {
      const res = await axios.get(BASE_URL + '/post/list')
      return { data: res.data }
    }
    
    // userId 不是 openid, 需要登录获取
    if (event.name === 'setCollectitonById') {
      const { postId, userId } = event
      const res = await axios.post(BASE_URL + `/collection/${postId}`, {
        userId
      })
      return { data: res.data }
    }

    if (event.name === 'setLikeById') {
      const { postId, userId } = event
      const res = await axios.post(BASE_URL + `/like/${postId}`, {
        userId
      })
      return { data: res.data }
    }

    if (event.name === 'getPostById') {
      const {postId, userId} = event
      const res = await axios.get(BASE_URL + `/post/${postId}`, {
        params: {
          userId
        }
      })
      return {data: res.data}
    }

    if (event.name === 'getCollectionList') {
      const { userId } = event
      const res = await axios.post(BASE_URL + `/collection/list}`, {
        userId
      })
      return { data: res.data }
    }

    if (event.name === 'login') {
      const res = await axios.post(BASE_URL + '/login', {
        avatar: event.avatar,
        openId: wxContext.OPENID,
        nickname: event.nickname
      })

      return {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
        userId: res.data.userId,
        success: res.data.success
      }
    }

  } catch (e) {
    console.log(e)
  }
}
