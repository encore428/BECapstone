require('dotenv').config()
const amqplib = require('amqplib')

const URL = process.env.CLOUDAMQP_URL || 'amqp://localhost'
const QUEUE = process.env.ACTL_QUEUE || 'actlq'

module.exports = () => {
  const service = {}

  service.publishActlq = async (actl, auid, email, reqType) => {
    const client = await amqplib.connect(URL)
    const channel = await client.createChannel()
    await channel.assertQueue(QUEUE)
    const result = await channel.sendToQueue(
      QUEUE, 
      Buffer.from(JSON.stringify({actl, auid, email, reqType})),
      {contentType: 'application/json'}
    )

    await channel.close()
    await client.close()

    return result
  }


  return service
}

