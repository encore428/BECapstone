const express = require('express')
const Todo = require('../models/todo')

module.exports = (db) => {
  const router = express.Router()
  const isInteger = (n) =>  /^\+?(0|[1-9]\d*)$/.test(n)

  /**
   * @openapi
   * components:
   *  schemas:
   *    Todo:
   *      type: object
   *      required:
   *        - title
   *      properties:
   *        name:
   *          type: string
   */

  /**
   * @openapi
   * /todos:
   *  post:
   *    tags:
   *    - todos
   *    description: Create a todo
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Todo'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Todo'
   *      400:
   *        description: title must be provied to cretae a Todo
   */
  router.post('/', async (req, res, next) => {
    const auid = req.uid
    const { title } = req.body
    if (!title || title.trim()==='') {
      res.status(400).send({message: 'title is mandatory'})
      return
    }
    const uid = auid
    const newTodo = new Todo({ title, uid })
    const todo = await db.insertTodo(newTodo)
    delete todo.actl
    res.status(201).send(todo)
  })

  /**
   * @openapi
   * /todos:
   *  get:
   *    tags:
   *    - todos
   *    description: Get all todos
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              todos:
   *                $ref: '#/components/schemas/Todo'
   */
  router.get('/', async (req, res, next) => {
    const auid = req.uid
    const todos = await db.findAllTodos(auid)
    res.send(todos.map((todo) => {delete todo.actl; return todo}))
  })

  /**
   * @openapi
   * /todos/{id}:
   *  get:
   *    tags:
   *    - todos
   *    description: Get todo
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Todo'
   *      403:
   *        description: User not autorised to access Todo with specified id
   *      404:
   *        description: Todo with specified id not found
*/
  router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    const auid = req.uid
    if (!isInteger(id) || (id<0)) {
      res.status(400).send({message: ':id must be a non-negative integer'})
      return
    }
    if (id>0) {
      const todo = await db.findTodo(id,auid)
      if (todo) {
        if (todo.actl) {
          const items = await db.getItemsByTodoId(id)
          delete todo.actl
          todo.items = items
          res.send(todo)
        } else  {
          res.status(403).send({message: `User_${auid} not authorised to access Todo_${id}`})
        }
      } else {
        res.status(404).send({message: `Todo_${id} not found`})
      }
    } else {
      const todos = await db.findAllTodos(auid)
      if (todos && todos.length>0) {
        const todosNitems = todos.map((todo) => {delete todo.actl; return todo})
        for (let i=0;i<todosNitems.length;i++) {
          delete todosNitems[i].actl
          let items = await db.getItemsByTodoId(todosNitems[i].id)
          todosNitems[i].items = items
        }
        res.send(todosNitems)
      } else {
        res.status(403).send({message: `User_${auid} has no accessible Todos`})
      }
    }
  })

  /**
   * @openapi
   * /todos/{id}:
   *  put:
   *    tags:
   *    - todos
   *    description: Update an todo
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Todo'
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Todo'
   *      400:
   *        description: title must be provided to update Todo
   *      403:
   *        description: User not autorised to update Todo with specified id
   *      404:
   *        description: Todo with specified id not found
   */
  router.put('/:id', async (req, res, next) => {
    const auid = req.uid
    const id = req.params.id
    const { title } = req.body
    if (!isInteger(id) || (id<=0)) {
      res.status(400).send({message: ':id has to be a positive number'})
      return
    }
    if (!title || title.trim()==='') {
      res.status(400).send({message: 'title is mandatory'})
      return
    }
    const updatedTodo = new Todo({ title: title.trim(), uid:auid })
    const todo = await db.updateTodo(id, updatedTodo)
    if (todo) {
      if (todo.actl) {
        delete todo.actl
        res.send(todo)
      } else {
        res.status(403).send({message: `User_${auid} not authorised to update Todo_${id}`})
      }
    } else {
      res.status(404).send({message: `Todo_${id} not found`})
    }
  })

  /**
   * @openapi
   * /todos/{id}:
   *  delete:
   *    tags:
   *    - todos
   *    description: Delete a todo
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    responses:
   *      200:
   *        description: Deleted successfull
   *      403:
   *        description: User not autorised to deete Todo with specified id
   *      404:
   *        description: Todo with specified id not found
   */
  router.delete('/:id', async (req, res, next) => {
    const auid = req.uid
    const id = req.params.id
    if (!isInteger(id) || (id<=0)) {
      res.status(400).send({message: ':id has to be a positive number'})
      return
    }
    const todo = await db.deleteTodo(id,auid)
    if (todo) {
      if (todo.actl) {
        delete todo.actl
        res.send(todo)
      } else {
        res.status(403).send({message: `User_${auid} not authorised to delete Todo_${id}`})
      }
    } else {
      res.status(404).send({message: `Todo_${id} not found`})
    }
  })

  return router
}