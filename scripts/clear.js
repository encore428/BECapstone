require('dotenv').config()
const db = require('../src/db')

db.clearAllTables().then(() => {
  console.log('Database table cleared')
}).catch((err) => {
  console.log(err)
  console.log('Database table clearing failed')
  process.exit(1)
})
