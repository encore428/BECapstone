const express = require('express')
const Actl = require('../models/actl')
// In the design of /actls entry points, :tid in /actls/:tid always refers to Todo.id of the
// Todo to which this access control is targeting.  It is never the id of the access control
// record itself.

module.exports = (db) => {
  const router = express.Router()
  const isInteger = (n) =>  /^\+?(0|[1-9]\d*)$/.test(n)
  
  /**
   * @openapi
   * components:
   *  schemas:
   *    Actl:
   *      type: object
   *      required:
   *        - tid
   *        - uid
   *        - rwlv
   *      properties:
   *        name:
   *          type: int
   */

  /**
   * @openapi
   * /actls:
   *  post:
   *    tags:
   *    - actls
   *    description: Create an actl
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Actl'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Actl'
   *      400:
   *        description: title must be provied to cretae a Actl
   */
  router.post('/:id', async (req, res, next) => {
    const tid = req.params.id
    const auid = req.uid
    const { uid, rwlv, email } = req.body
    if (!isInteger(tid) || (tid<=0)) {
      res.status(400).send({message: 'tid has to be a positive integer'})
      return
    }
    if (rwlv===undefined) {
      res.status(400).send({message: 'rwlv is mandatory'})
      return
    }
    if (!isInteger(rwlv) || (rwlv!==1 && rwlv!==3)) {
      res.status(400).send({message: 'rwlv must be 1 (read) or 3 (read and write)'})
      return
    }
    if (email===undefined) {
      if (uid===undefined) {
        res.status(400).send({message: 'uid mandatory in the absence of email'})
        return
      }
      if (!isInteger(uid) || (uid<=0)) {
        res.status(400).send({message: 'uid has to be a positive integer'})
        return
      }
      if (auid===uid) {
        res.status(400).send({message: 'you need not create your own access'})
        return
      }
    } else {
      if ((typeof email)!=='string') {
        res.status(400).send({message: 'email should be a string'})
        return
      }
      if (email.trim()==='') {
        res.status(400).send({message: 'email should not be blank'})
        return
      }
      if (uid!==undefined) {
        res.status(400).send({message: 'uid should not be provided when email is specified'})
        return
      }
    }
    const newActl = email?new Actl({ tid, uid:0, rwlv }):new Actl({ tid, uid, rwlv })
    const actl = await db.updateActl(newActl, auid, email, isPost=true)
    if (actl.tid===0) {
      res.status(404).send({message: `Todo_${tid} does not exist`})
    } else if (actl.rwlv===-1) {
      res.status(403).send({message: `User_${auid} does not own Todo_${tid}`})
    } else if (actl.uid===0) {
      res.status(404).send({message: `User_${email?email:uid} does not exist`})
    } else if (auid===actl.uid) {
      res.status(403).send({message: 'you need not create your own access'})
    } else {
      res.status(201).send(actl)
    }
  })


  /**
   * @openapi
   * /actls/{tid}:
   *  put:
   *    tags:
   *    - actls
   *    description: Update an actl
   *    parameters:
   *      - in: path
   *        name: tid
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Actl'
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Actl'
   *      400:
   *        description: title must be provided to update Actl
   *      403:
   *        description: User not autorised to update Actl with specified id
   *      404:
   *        description: Actl with specified id not found
   */
  router.put('/:id', async (req, res, next) => {
    const tid = req.params.id
    const auid = req.uid
    const { uid, rwlv, email } = req.body
    if (!isInteger(tid) || (tid<=0)) {
      res.status(400).send({message: 'tid has to be a positive integer'})
      return
    }
    if (rwlv===undefined) {
      res.status(400).send({message: 'rwlv is mandatory'})
      return
    }
    if (!isInteger(rwlv) || (rwlv!==1 && rwlv!==3)) {
      res.status(400).send({message: 'rwlv must be 1 (read) or 3 (read and write)'})
      return
    }
    if (email===undefined) {
      if (uid===undefined) {
        res.status(400).send({message: 'uid mandatory in the absence of email'})
        return
      }
      if (!isInteger(uid) || (uid<=0)) {
        res.status(400).send({message: 'uid has to be a positive integer'})
        return
      }
      if (auid===uid) {
        res.status(400).send({message: 'you cannot and need not change your own access'})
        return
      }
    } else {
      if ((typeof email)!=='string') {
        res.status(400).send({message: 'email should be a string'})
        return
      }
      if (email.trim()==='') {
        res.status(400).send({message: 'email should not be blank'})
        return
      }
      if (uid!==undefined) {
        res.status(400).send({message: 'uid should not be provided when email is specified'})
        return
      }
    }
    const updatedActl = new Actl({ tid, uid, rwlv })
    const actl = await db.updateActl(updatedActl,auid,email,isPost=false)
    if (actl.id===0) {
      res.status(404).send({message: `Actl for User_${email?email:uid} to Todo_${tid} does not exist`})
    } else if (actl.tid===0) {
      res.status(404).send({message: `Todo_${tid} does not exist`})
    } else if (actl.rwlv===-1) {
      res.status(403).send({message: `User_${auid} does not own Todo_${tid}`})
    } else if (actl.uid===0) {
      if (!email) {
        res.status(404).send({message: `User_${uid} does not exist`})
      } else {
        res.status(404).send({message: `User_${email} does not exist`})
      }
    } else if (auid===actl.uid) {
      res.status(403).send({message: 'you cannot and need not change your own access'})
    } else {
      res.status(200).send(actl)
    }
  })

  /**
   * @openapi
   * /actls/{id}:
   *  delete:
   *    tags:
   *    - actls
   *    description: Delete a actl
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
   *        description: User not autorised to deete Actl with specified id
   *      404:
   *        description: Actl with specified id not found
   */
  router.delete('/:id', async (req, res, next) => {
    const tid = req.params.id
    const auid = req.uid
    const { uid, email } = req.body
    if (!isInteger(tid) || (tid<=0)) {
      res.status(400).send({message: 'tid has to be a positive integer'})
      return
    }
    if (email===undefined) {
      if (uid===undefined) {
        res.status(400).send({message: 'uid mandatory in the absence of email'})
        return
      }
      if (!isInteger(uid) || (uid<=0)) {
        res.status(400).send({message: 'uid has to be a positive integer'})
        return
      }
      if (auid===uid) {
        res.status(400).send({message: 'you cannot and need not delete your own access'})
        return
      }
    } else {
      if ((typeof email)!=='string') {
        res.status(400).send({message: 'email should be a string'})
        return
      }
      if (email.trim()==='') {
        res.status(400).send({message: 'email should not be blank'})
        return
      }
      if (uid!==undefined) {
        res.status(400).send({message: 'uid should not be provided when email is specified'})
        return
      }
    }
    const rwlv = 0
    const updatedActl = new Actl({ tid, email, uid, rwlv })
    const actl = await db.updateActl(updatedActl, auid, email, isPost=false)
    if (actl.id===0) {
      res.status(404).send({message: `Actl for User_${email?email:uid} to Todo_${tid} does not exist`})
    } else if (actl.tid===0) {
      res.status(404).send({message: `Todo_${tid} does not exist`})
    } else if (actl.rwlv===-1) {
      res.status(403).send({message: `User_${auid} does not own Todo_${tid}`})
    } else if (actl.uid===0) {
      if (!email) {
        res.status(404).send({message: `User_${uid} does not exist`})
      } else {
        res.status(404).send({message: `User_${email} does not exist`})
      }
    } else if (auid===actl.uid) {
      res.status(403).send({message: 'you cannot and need not delete your own access'})
    } else {
      res.status(200).send(actl)
    }

  })

  return router
}