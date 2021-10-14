const Todo = require('../models/todo')
const Item = require('../models/item')

module.exports = (pool) => {
  const db = {}

  db.getItemsByTodoId = async (tid) => {
    const res = await pool.query(
      'SELECT id, title, completed, tid, uid FROM Items WHERE NOT deleted AND tid=$1 ORDER BY id',
      [tid]
    )
    return res.rows.map(row => new Item(row))
  }

  db.insertItem = async (item, auid) => {
    const item1 = new Item (item.title, item.tid, item.uid)
    const chkTodo = await pool.query(
      'SELECT id, uid FROM Todos WHERE NOT deleted AND id=$1',
      [item.tid]
    )
    if (chkTodo.rowCount===0) {
      item1.tid = 0
      item1.title = `Todo_${item.tid} not found`
    } else {
      if (chkTodo.rows[0].uid!==item.uid) {
        const chk2 = await pool.query(
          'SELECT rwlv FROM Actls WHERE tid=$1 AND uid=$2 and rwlv=3',
          [item.tid,item.uid]
        )
        if (chk2.rowCount===0) {
          item1.uid = 0
          item1.title = `User_${item.uid} has no access to add Item to Todo_${item.tid}`}    
      }
    }
    if (item1.tid===0||item1.uid===0) {
      return item1                                      // Todo by Item.tid does not exist
    }
    const res = await pool.query(
      'INSERT INTO Items (title,tid,uid) VALUES ($1,$2,$3) RETURNING id,title,completed,tid,uid',
      [item.title, item.tid, item.uid]
    )
    return new Item(res.rows[0])
  }
  

  db.updateItem = async (item, auid) => {
    const item1 = new Item (item)
    // Check that target Item exists
    const chkItem = await pool.query(
      'SELECT id, title, completed, tid, uid FROM Items WHERE NOT deleted AND id=$1',
      [item.id]
    )
    if (chkItem.rowCount===0) {
      item1.id = 0 
      item1.title = `Item_${item.id} not found`
      return item1
    }
    const oldItem = new Item (chkItem.rows[0])
    // Load the Todo that originally owns the Target Item
    const chk2 = await pool.query(
      'SELECT id,title,uid FROM Todos WHERE NOT deleted AND id=$1',
      [oldItem.tid]
    )
    if (chk2.rowCount===0) {
      item1.id = 0 
      item1.title = `Todo_${oldItem.tid} of Item_${item.id} not found`
      return item1
    }
    if (item.title===undefined) {item.title=oldItem.title;item1.title=oldItem.title}
    if (item.completed===undefined) {item.completed=oldItem.completed;item1.completed=oldItem.completed}
    if (item.tid===undefined) {item.tid=oldItem.tid;item1.tid=oldItem.tid}
    const oldTodo = new Todo (chk2.rows[0])
    // Check that the authed user is either the owner of, or has necessary access to, the original owning Todo of the Target Item
    if (oldTodo.uid!==auid) {
      const chkActl = await pool.query(
        'SELECT rwlv FROM Actls WHERE tid=$1 AND uid=$2',
        [oldItem.tid, auid]
      )
      if (chkActl.rowCount===0) {
        item1.uid = 0
        item1.title = `User_${auid} has no access to Todo_${oldItem.tid} (current Todo of Item_${item.id})`
        return item1
      }
      if ((item.tid!==oldItem.tid) && (chkActl.rows[0].rwlv!==3)) {
        item1.uid = 0                            // auid has no write access to the Original owning Todo of Target Item
        item1.title = `User_${auid} has no write access to Todo_${oldItem.tid} (current Todo of Item_${item.id})`
        return item1
      }
    }
    // if item.tid is amongst the change, make sure that the other Todo exists, and that auid has write access
    if (item.tid!==oldItem.tid) {
      const chk4 = await pool.query(
        'SELECT id,title,uid FROM Todos WHERE NOT deleted AND id=$1',
        [item.tid]
      )
      if (chk4.rowCount===0) {
        item1.tid = 0
        item1.title = `Proposed Todo_${item.tid} not found`
        return item1
      }
      // Check that the authed user is either the owner of, or has write access to, the original Todo that owns the item
      if (chk4.rows[0].uid!==auid) {
        const chk5 = await pool.query(
          'SELECT rwlv FROM Actls WHERE tid=$1 AND uid=$2 AND rwlv=3',
          [item.tid, auid]
        )
        if (chk5.rowCount===0) {
          item1.uid = 0
          item1.title = `User_${auid} has no write access to proposed Todo_${item.tid}`
          return item1
        }
      }
    }
    // Check that there are changes to make
    if ((item1.title===oldItem.title)&&(item1.completed===oldItem.completed)&&(item1.tid===oldItem.tid)) {
      return oldItem                            // no change was made
    }
    let res
    if ((item1.title!==oldItem.title) || (item1.tid!==oldItem.tid)) {
      res = await pool.query(
        'UPDATE Items SET title=$2,tid=$3 WHERE id=$1 RETURNING id,title,completed,tid,uid',
        [item1.id, item1.title, item1.tid]
      )
    }
    if (item1.completed!==oldItem.completed) {
      res = await pool.query(
        'UPDATE Items SET completed=$2 WHERE id=$1 RETURNING id,title,completed,tid,uid',
        [item1.id, item1.completed]
      )
    }
    return new Item(res.rows[0])
  }


  db.deleteItem = async (id, auid) => {
    const uid = auid
    const item1 = new Item (id, uid)
    // Check that target Item exists
    const chk1 = await pool.query(
      'SELECT id, title, completed, tid, uid FROM Items WHERE NOT deleted AND id=$1',
      [id]
    )
    if (chk1.rowCount===0) {
      item1.id = 0                               // Target Item using item.id not found
      item1.title = `Item_${id} not found`
      return item1
    }
    const oldItem = new Item (chk1.rows[0])
    // Load Todo that owns the Item
    const chk2 = await pool.query(
      'SELECT id,title,uid FROM Todos WHERE NOT deleted AND id=$1',
      [oldItem.tid]
    )
    if (chk2.rowCount===0) {
      item1.id = 0 
      item1.title = `Todo_${oldItem.tid} of Item_${id} not found`
      return item1
    }
    const oldTodo = new Todo (chk2.rows[0])
    // Check that the authed user is either the owner of, or has write access to, the original owning Todo of the Target Item
    if (oldTodo.uid!==auid) {
      const chk3 = await pool.query(
        'SELECT rwlv FROM Actls WHERE tid=$1 AND uid=$2 AND rwlv=3',
        [oldItem.tid, auid]
      )
      if (chk3.rowCount===0) {
        item1.uid = 0                            // auid has no acces to the Original owning Todo of Target Item
        item1.title = `User_${auid} has no access to delete Item_${id} of Todo_${oldItem.tid}`
        return item1
      }
    }
    const res = await pool.query(
      'UPDATE Items SET deleted=TRUE WHERE id=$1 RETURNING id,title,completed,tid,uid',
      [oldItem.id]
    )
    return new Item(res.rows[0])
  }

  return db
}