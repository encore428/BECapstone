const express = require('express')
const Item = require('../models/item')
// In the design of /items entry points:
// * :id in /items/:id refers to Item.id.
// * tid of the Todo to which the item is a child of, can be found in body.
// As such, /items/:id is not applicable to POST/items

module.exports = (db) => {
  const router = express.Router()
  const isInteger = (n) =>  /^\+?(0|[1-9]\d*)$/.test(n)
  
  /**
   * @openapi
   * components:
   *  schemas:
   *    Item:
   *      type: object
   *      required:
   *        - title
   *        - completed
   *        - tid
   *        - uid
   *      properties:
   *        name:
   *          type: string
   */

  /**
   * @openapi
   * /items:
   *  post:
   *    tags:
   *    - items
   *    description: Create a item
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Item'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   *      400:
   *        description: title must be provied to cretae a Item
   */
  router.post('/', async (req, res, next) => {
    const auid = req.uid
    const { title, tid } = req.body
    if (!title || title.trim()==='') {
      res.status(400).send({message: 'title is mandatory'})
      return
    }
    if (!isInteger(tid) || (tid<=0)) {
      res.status(400).send({message: 'tid should be a positive integer'})
      return
    }
    const uid = auid
    const newItem = new Item({ title, tid, uid })
    const item = await db.insertItem(newItem)
    if (item.tid===0) {
      res.status(404).send({message: `Todo_${tid} does not exist`})
    } else if (item.uid===0) {
      res.status(403).send({message: `User_${auid} not authorised to add items to Todo_${tid}`})
    } else {
      res.status(201).send(item)
    }
  })


  /**
   * @openapi
   * /items/{id}:
   *  put:
   *    tags:
   *    - items
   *    description: Update a item
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
   *            $ref: '#/components/schemas/Item'
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Item'
   *      400:
   *        description: title must be provided to update Item
   *      403:
   *        description: User not autorised to update Item with specified id
   *      404:
   *        description: Item with specified id not found
   */
  router.put('/:id', async (req, res, next) => {
    const auid = req.uid
    const id = req.params.id
    let { title, completed, tid } = req.body
    if (!isInteger(id) || (id<=0)) {
      res.status(400).send({message: ':id has to be a positive integer'})
      return
    }
    if ((title===undefined) && (completed===undefined) && (tid===undefined)) {
      res.status(400).send({message: 'you must provide a least one of title, completed, tid'})
      return
    }
    if (title!==undefined) {
      if (typeof title !== 'string') {
        res.status(400).send({message: 'title should be a string'})
        return
      }
      title = title.trim()
      if (title.trim()==='') {
        res.status(400).send({message: 'title should not be blank'})
        return
      }
    }
    if ((completed!==undefined) && (typeof completed !== 'boolean')) {
      res.status(400).send({message: 'completed if provided, has to be a boolean'})
      return
    }
    if (tid!==undefined) {
      if (!isInteger(tid) || (tid<=0)) {
        res.status(400).send({message: 'tid if provided, has to be a positive integer'})
        return
      }
    }
    const updatedItem = new Item({ id, title, completed, tid })
    if (completed===undefined) {updatedItem.completed=undefined}
    const item = await db.updateItem(updatedItem, auid)
    if ((item.id===0) || (item.tid===0)) {
      res.status(404).send({message: item.title})
    } else if (item.uid===0) {
      res.status(403).send({message: item.title})
    } else {
      res.send(item)
    }
  })

  /**
   * @openapi
   * /items/{id}:
   *  delete:
   *    tags:
   *    - items
   *    description: Delete a item
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
   *        description: User not autorised to deete Item with specified id
   *      404:
   *        description: Item with specified id not found
   */
  router.delete('/:id', async (req, res, next) => {
    const auid = req.uid
    const id = req.params.id
    if (!isInteger(id) || (id<=0)) {
      res.status(400).send({message: ':id has to be a positive integer'})
      return
    }
    const item = await db.deleteItem(id,auid)
    if (item.id===0) {
      res.status(404).send({message: item.title})
    } else if (item.uid===0) {
      res.status(403).send({message: item.title})
    } else {
      res.send(item)
    }
  })

  return router
}