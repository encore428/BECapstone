require('dotenv').config({ path: '.env.test' })
const App = require('../src/app')
const Router = require('../src/routes')
const AuthMiddleware = require('../src/middlewares/auth')
const AuthService = require('../src/services/auth')
const AmqpService = require('../src/services/amqp')
const db = require('../src/db')

const utils = {}

const amqpService = AmqpService()
const authService = AuthService(db)
const authMiddleware = AuthMiddleware(authService)
const router = Router(authMiddleware, authService, amqpService, db)
const app = App(router)

utils.app = app
utils.db = db

utils.credentials = [
  { username: 'one@abc.com', password: '1234', token: '' },
  { username: 'two@abc.com', password: '1234', token: '' },
  { username: 'three@abc.com', password: '3456', token: '' },
  { username: 'four@abc.com', password: '1234', token: '' }
]

utils.todos = [
  { id: 1, title: `Todo_1 created by ${utils.credentials[1-1].username}`, uid: 1},
  { id: 2, title: `Todo_2 created by ${utils.credentials[1-1].username}`, uid: 1},
  { id: 3, title: `Todo_3 created by ${utils.credentials[2-1].username}`, uid: 2},
  { id: 4, title: `Todo_4 created by ${utils.credentials[2-1].username}`, uid: 2},
  { id: 5, title: `Todo_5 created by ${utils.credentials[2-1].username}`, uid: 2},
  { id: 6, title: `Todo_6 created by ${utils.credentials[3-1].username}`, uid: 3},
  { id: 7, title: `Todo_7 created by ${utils.credentials[3-1].username}`, uid: 3},
  { id: 8, title: `Todo_8 created by ${utils.credentials[3-1].username}`, uid: 3},
  { id: 9, title: `Todo_9 created by ${utils.credentials[3-1].username}`, uid: 3}
]


utils.actls = [
  { id:  1, tid:5, uid: 3, rwlv:3},
  { id:  2, tid:5, uid: 4, rwlv:1},
  { id:  3, tid:5, uid: 1, rwlv:1}
]

utils.items = [
  { id:  1, title: `Item_1 of Todo_1 created by ${utils.credentials[1-1].username}`, completed: false, tid:1, uid: 1},
  { id:  2, title: `Item_2 of Todo_5 created by ${utils.credentials[2-1].username}`, completed: false, tid:5, uid: 2},
  { id:  3, title: `Item_3 of Todo_4 created by ${utils.credentials[2-1].username}`, completed: false, tid:4, uid: 2},
  { id:  4, title: `Item_4 of Todo_4 created by ${utils.credentials[2-1].username}`, completed: false, tid:4, uid: 2},
  { id:  5, title: `Item_5 of Todo_7 created by ${utils.credentials[3-1].username}`, completed: false, tid:7, uid: 3},
  { id:  6, title: `Item_6 of Todo_7 created by ${utils.credentials[3-1].username}`, completed: false, tid:7, uid: 3},
  { id:  7, title: `Item_7 of Todo_8 created by ${utils.credentials[3-1].username}`, completed: false, tid:8, uid: 3},
  { id:  8, title: `Item_8 of Todo_8 created by ${utils.credentials[3-1].username}`, completed: false, tid:8, uid: 3},
  { id:  9, title: `Item_9 of Todo_9 created by ${utils.credentials[3-1].username}`, completed: false, tid:9, uid: 3},
  { id: 10, title: `Item_10 of Todo_9 created by ${utils.credentials[3-1].username}`, completed: false, tid:9, uid: 3}
]

utils.dbSetup = async () => {
  await db.fullReset()
}

utils.dbReset = async () => {
  await db.clearAllTables()
}

utils.teardown = async () => {
  await db.end()
}

utils.registerUser = async (username, password) => {
  const token = await authService.registerUser(username, password)
  return `Bearer ${token}`
}

utils.loginUser = async (username, password) => {
  const token = await authService.loginUser(username, password)
  return `Bearer ${token}`
}

module.exports = utils