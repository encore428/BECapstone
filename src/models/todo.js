class Todo {
  constructor({ id, title, uid, actl=true }) {
    this.id = id
    this.title = title
    this.uid = uid
    this.actl = actl
  }
}

module.exports = Todo
