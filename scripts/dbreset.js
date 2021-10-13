require('dotenv').config()
const db = require('../src/db')

db.clearAllTables().then(() => {
  console.log('Database all tables cleared')
}).catch((err) => {
  console.log(err)
  console.log('Database all tables clearing failed')
  process.exit(1)
})
