require('dotenv').config()
const amqplib = require('amqplib')
const db = require('./db')


const URL = process.env.CLOUDAMQP_URL || 'amqp://localhost'
const QUEUE = process.env.ACTL_QUEUE || 'actlq'

async function main () {
  const client = await amqplib.connect(URL)
  const channel = await client.createChannel()
  await channel.assertQueue(QUEUE)
  channel.consume(QUEUE, async (msg) => {
    const data = JSON.parse(msg.content)
    console.log(`[INFO] retrived from ${QUEUE}:`, data)

    const actl = await db.updateActl(data.actl, data.auid, data.email, data.reqType)
    if (actl) {
      if (actl.id===0) {
        console.log(`[ERROR] target Actl to ${data.reqType} does not exist`)
      } else if (actl.tid===0) {
        console.log(`[VALIDATION] Todo_${data.actl.tid} does not exist`)
      } else if (actl.rwlv===-1) {
        console.log(`[VALIDATION] User_${data.auid} does not own Todo_${data.actl.tid}`)
      } else if (actl.uid===0) {
        console.log(`[VALIDATION] User_${data.email?data.email:data.actl.uid} does not exist`)
      } else if (data.auid===actl.uid) {
        console.log('[VALIDATION] you need not create your own access')
      } else {
        console.log(`[SUCCESS] ${data.reqType} completed: ${JSON.stringify(actl)}`)
      }
      channel.ack(msg)
    } else {
      channel.nack(msg)
    }
  })
}

main().catch(err => {
  console.log(err)
})
