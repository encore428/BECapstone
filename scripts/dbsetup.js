require('dotenv').config()
const db = require('../src/db')

db.fullReset().then(() => {
  console.log('Database table drop and recreate completed')
  process.exit()
}).catch((err) => {
  console.log(err)
  console.log('Database drop and recreate failed')
  process.exit(1)
})