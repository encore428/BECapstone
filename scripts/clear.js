require('dotenv').config()
const db = require('../src/db')

db.clearActlsTables().then(() => {
  console.log('Database Actls table cleared')
  process.exit()
}).catch((err) => {
  console.log(err)
  console.log('Database Actls table clearing failed')
  process.exit(1)
})

db.clearItemsTables().then(() => {
  console.log('Database Items table cleared')
  process.exit()
}).catch((err) => {
  console.log(err)
  console.log('Database Items table clearing failed')
  process.exit(1)
})

db.clearTodosTables().then(() => {
  console.log('Database Todos table cleared')
  process.exit()
}).catch((err) => {
  console.log(err)
  console.log('Database Todos table clearing failed')
  process.exit(1)
})


db.clearUsersTables().then(() => {
  console.log('Database Users table cleared')
  process.exit()
}).catch((err) => {
  console.log(err)
  console.log('Database Users table clearing failed')
  process.exit(1)
})