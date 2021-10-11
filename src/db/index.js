const { Pool } = require('pg')
const fs = require('fs')

let pool
if (process.env.MYHEROKU === 'true'){
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync(`${__dirname}/global-bundle.pem`)
    }
  })
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
}

const db = {
  ...require('./users')(pool),
  ...require('./todos')(pool),
  ...require('./items')(pool),
  ...require('./actls')(pool),
}

db.initialise = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(100) NOT NULL
    )
  `)
  await pool.query(`
  CREATE TABLE IF NOT EXISTS Todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      uid INTEGER NOT NULL,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,
      FOREIGN KEY (uid) REFERENCES Users(id)
    )
  `)
  await pool.query(`
  CREATE TABLE IF NOT EXISTS Items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      tid INTEGER NOT NULL,
      uid INTEGER NOT NULL,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,
      FOREIGN KEY (tid) REFERENCES Todos(id),
      FOREIGN KEY (uid) REFERENCES Users(id)
    )
  `)
  await pool.query(`
  CREATE TABLE IF NOT EXISTS Actls (
      id SERIAL PRIMARY KEY,
      tid INTEGER NOT NULL,
      uid INTEGER NOT NULL,
      rwlv INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (tid) REFERENCES Todos(id),
      FOREIGN KEY (uid) REFERENCES Users(id)
    )
  `)
}

db.clearActlsTables = async () => {
  await pool.query('DELETE FROM Actls')
  await pool.query('ALTER SEQUENCE actls_id_seq RESTART')
}
db.clearItemsTables = async () => {
  await pool.query('DELETE FROM Items')
  await pool.query('ALTER SEQUENCE items_id_seq RESTART')
}
db.clearTodosTables = async () => {
  await pool.query('DELETE FROM Todos')
  await pool.query('ALTER SEQUENCE todos_id_seq RESTART')
}
db.clearUsersTables = async () => {
  await pool.query('DELETE FROM Users')
  await pool.query('ALTER SEQUENCE users_id_seq RESTART')
}

db.end = async () => {
  await pool.end()
}

module.exports = db