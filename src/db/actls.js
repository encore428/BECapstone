const Actl = require('../models/actl')

module.exports = (pool) => {
  const db = {}

  // This one method handles all INSERT/UPDATE/DELETE requests to Actls
  db.updateActl = async (actl, auid, email, reqType) => {
    const actl1 = new Actl (actl.tid, actl.uid, actl.rwlv)
    const chkTodo = await pool.query(
      'SELECT id, title, uid FROM Todos WHERE id=$1 AND NOT deleted',
      [actl.tid]
    )
    if (chkTodo.rowCount===0) {
      actl1.tid = 0                           // this means Todo[actl.tid] does not exist
      return actl1
    }
    if (chkTodo.rows[0].uid!==auid) {
      actl1.rwlv = -1            // User[auid] is not the owner of Todo[actl.tid] and thus not authoirsed
      return actl1
    }
    if (email) {
      const chkUser = await pool.query(
        'SELECT id FROM Users WHERE username=$1',
        [email]
      )
      if (chkUser.rowCount===0) {
        actl1.uid = 0                        // this means User[email] does not exist
        return actl1
      } else {
        actl.uid = chkUser.rows[0].id
        actl1.uid = chkUser.rows[0].id
      }
    } else {
      const chkUser = await pool.query(
        'SELECT id FROM Users WHERE id=$1',
        [actl.uid]
      )
      if (chkUser.rowCount===0) {
        actl1.uid = 0                        // this means User[actl.uid] does not exist
        return actl1
      }
    }
    if (actl1.uid===auid) {
      return actl1             // there is no need to give access to yourself
    }
    // now that no error has been detected, continue to perform updates
    const chkActl = await pool.query(
      'SELECT id, tid, uid, rwlv FROM Actls WHERE tid=$1 AND uid=$2',
      [actl.tid, actl.uid]
    )
    if (chkActl.rowCount===0) {
      // actl does not exist,
      if (reqType==='post') {
        // so create it and return
        const res = await pool.query(
          'INSERT INTO Actls (tid,uid,rwlv) VALUES ($1,$2,$3) RETURNING id,tid,uid,rwlv',
          [actl.tid, actl.uid, actl.rwlv]
        )
        return new Actl(res.rows[0])
      }
      if (reqType!=='post' || (actl.rwlv===0)) {
        // if this is a PUT or DELETE, return id=0 to signal old actl not found to update/delete
        actl1.id=0
        return actl1
      }
    }
    // now that an old actl exists
    const oldActl = new Actl(chkActl.rows[0])
    if (actl.rwlv===0) {
      // this is a DELETE, delete actl and return
      await pool.query(
        'DELETE FROM Actls WHERE id=$1 RETURNING id,tid,uid,rwlv',
        [oldActl.id]
      )
      return oldActl
    }
    if (oldActl.rwlv===actl.rwlv) {
      // the actl already exist and with same access level, just return
      return oldActl
    }
    if ((oldActl.rwlv>actl.rwlv) && (reqType==='post')) {
      // the actl already exist with more access level, and this is a POST just return
      return oldActl
    }
    // otherwise, update actl and then return
    const res = await pool.query(
      'UPDATE Actls SET rwlv=$2 WHERE id=$1 RETURNING id,tid,uid,rwlv',
      [oldActl.id,actl.rwlv]
    )
    return res.rowCount ? new Actl(res.rows[0]) : null
  }

  return db
}