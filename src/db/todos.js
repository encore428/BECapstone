const Todo = require('../models/todo')

module.exports = (pool) => {
  const db = {}

  db.insertTodo = async (todo) => {
    const res = await pool.query(
      'INSERT INTO Todos (title,uid) VALUES ($1,$2) RETURNING id, title, uid, TRUE AS actl',
      [todo.title, todo.uid]
    )
    return new Todo(res.rows[0])
  }
  
  db.findAllTodos = async (uid) => {
    const res = await pool.query(
      'SELECT id, title, uid, TRUE AS actl FROM Todos WHERE NOT deleted AND (uid=$1 OR id IN (SELECT tid FROM Actls WHERE uid=$1)) ORDER BY id',
      [uid]
    )      
    return res.rows.map(row => new Todo(row))
  }

  db.findTodo = async (id, uid) => {
    const res = await pool.query(
      'SELECT id, title, uid, (uid=$2 OR ($2 IN (SELECT uid FROM Actls WHERE tid=$1))) AS actl FROM Todos WHERE NOT deleted AND id=$1',
      [id, uid]
    )
    return res.rowCount ? new Todo(res.rows[0]) : null
  }

  db.updateTodo = async (id, todo) => {
    const chk = await pool.query(
      'SELECT id, title, uid, (uid=$2 OR ($2 IN (SELECT uid FROM Actls WHERE tid=$1 AND rwlv=3))) AS actl FROM Todos WHERE NOT deleted AND id=$1',
      [id, todo.uid]
    )
    if (chk.rowCount===0) {
      return null
    }
    const row = new Todo(chk.rows[0])
    if (!row.actl) {
      return row
    }
    const res = await pool.query(
      'UPDATE Todos SET title=$2 WHERE id=$1 RETURNING id, title, uid, TRUE AS actl',
      [id, todo.title]
    )
    return res.rowCount ? new Todo(res.rows[0]) : null
  }

  db.deleteTodo = async (id,auid) => {

    const chk = await pool.query(
      'SELECT id, title, uid, (uid=$2 OR ($2 IN (SELECT uid FROM Actls WHERE tid=$1 AND rwlv=3))) AS actl FROM Todos WHERE NOT deleted AND id=$1',
      [id, auid]
    )
    if (chk.rowCount===0) {
      return null
    }
    const row = new Todo(chk.rows[0])
    if (!row.actl) {
      return row
    }
    const res = await pool.query(
      'UPDATE Todos SET deleted=TRUE WHERE id=$1 RETURNING id, title, uid, deleted AS actl',
      [id]
    )
    return res.rowCount ? new Todo(res.rows[0]) : null
  }

  return db
}