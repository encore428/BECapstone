// UNIT TEST for Actl queuing entry points
const request = require('supertest')
const utils = require('../../tests/utils')

const app = utils.app
//const db = utils.db

beforeAll(async () => {
  await utils.dbReset()
  utils.credentials[0].token = await utils.registerUser(utils.credentials[0].username, utils.credentials[0].password)
  utils.credentials[1].token = await utils.registerUser(utils.credentials[1].username, utils.credentials[1].password)
  utils.credentials[2].token = await utils.registerUser(utils.credentials[2].username, utils.credentials[2].password)
  utils.credentials[3].token = await utils.registerUser(utils.credentials[3].username, utils.credentials[3].password)
  utils.credentials[0].token = await utils.loginUser(utils.credentials[0].username, utils.credentials[0].password)
  utils.credentials[2].token = await utils.loginUser(utils.credentials[2].username, utils.credentials[2].password)
})

afterAll(async () => {
  //await utils.teardown()
})

describe('ACTLQ Unit Tests: test data preparations', () => {
  describe('1: POST/todos to create Todos', () => {
    for (let idx=0;idx<utils.todos.length;idx++) {
      const id=idx+1
      it(`successful creation of Todo_${id} by User_${utils.todos[id-1].uid} using login token`, async () => {
        const auid=utils.todos[id-1].uid
        const expected = JSON.parse(JSON.stringify(utils.todos[id-1]))
        return await request(app)
          .post('/todos')
          .set('Authorization', utils.credentials[auid-1].token)
          .send({title: utils.todos[id-1].title})
          .expect(201)
          .then(response => {
            expect(response.body)
              .toEqual(expected)
          })
      })
    }
  })
  describe('2: POST/takks to create Items', () => {
    for (let idx=0;idx<utils.items.length;idx++) {
      const i=idx
      it(`Create Item_${utils.items[i].id} of ${utils.items.length}`, async () => {
        return await request(app)
          .post('/items')
          .set('Authorization', utils.credentials[utils.items[i].uid-1].token)
          .send({tid: utils.items[i].tid, title: utils.items[i].title})
          .expect(201)
          .then(response => {
            expect(response.body)
              .toEqual(utils.items[i])
          })
      })
    }
  })
})

describe('ACTLQ Validate Tests', () => {
  describe('1: POST/actlq/:tid, input validation before database, negative test cases', () => {
    it('should reject 400 when :tid not numeric', async () => {
      const tid='xyz'
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when :tid is negative', async () => {
      const tid=-5
      const auid=2
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when :tid is 0', async () => {
      const tid=-0
      const auid=3
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when body is absent', async () => {
      const tid=1
      const auid=4
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv is mandatory'})
        })
    })
    it('should reject 400 when body.rwlv is absent', async () => {
      const tid=1
      const uid=1
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv is mandatory'})
        })
    })
    it('should reject 400 when body.rwlv is not numeric', async () => {
      const tid=1
      const rwlv='xyz'
      const uid=1
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv must be 1 (read) or 3 (read and write)'})
        })
    })
    it('should reject 400 when body.rwlv is not 1 nor 3', async () => {
      const tid=1
      const rwlv=2
      const uid=1
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv must be 1 (read) or 3 (read and write)'})
        })
    })
    it('should reject 400 when body.uid is absent', async () => {
      const tid=1
      const rwlv=1
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid mandatory in the absence of email'})
        })
    })
    it('should reject 400 when body.uid is 0', async () => {
      const tid=1
      const rwlv=1
      const uid=0
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid has to be a positive integer'})
        })
    })
    it('should reject 400 when body.uid is same as auid', async () => {
      const tid=1
      const rwlv=1
      const uid=1
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'you need not create your own access'})
        })
    })
    it('should reject 400 when both body.uid and body.email are present', async () => {
      const tid=4
      const rwlv=3
      const uid=2
      const email='two@abc.com'
      const auid=2
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid should not be provided when email is specified'})
        })
    })
    it('should reject 400 when both body.email not a string', async () => {
      const tid=4
      const rwlv=3
      const email=2
      const auid=2
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'email should be a string'})
        })
    })
    it('should reject 400 when body.email is blank', async () => {
      const tid=4
      const rwlv=3
      const auid=2
      const email=' '
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({email, rwlv})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'email should not be blank'})
        })
    })
  })
  describe('2: POST/actlq/:tid, input validation against database, negative test cases', () => {
    it('should return 202 that request has been queued when body.uid does not exist', async () => {
      const tid=1
      const rwlv=1
      const uid=5
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to grant User_${uid} ${rwlv===1?'read':'write'} access to Todo_${tid} queued`})
        })
    })
    it('should reject 202 that request has been queued when Todo(:tid) does not exist', async () => {
      const tid=11
      const rwlv=1
      const uid=2
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to grant User_${uid} ${rwlv===1?'read':'write'} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when requesting User does not own Todo(:tid)', async () => {
      const tid=4
      const rwlv=1
      const uid=2
      const auid=1
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to grant User_${uid} ${rwlv===1?'read':'write'} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when body.email does not exist', async () => {
      const tid=4
      const rwlv=3
      const email='three@abcd.com'
      const auid=2
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to grant User_${email} ${rwlv===1?'read':'write'} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when body.email is same as requesting User', async () => {
      const tid=4
      const rwlv=3
      const email='two@abc.com'
      const auid=2
      return await request(app)
        .post(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to grant User_${email} ${rwlv===1?'read':'write'} access to Todo_${tid} queued`})
        })
    })
  })
  describe('3: PUT/actlq/:tid, input validation before database, negative test cases', () => {
    it('should reject 400 when :tid not numeric', async () => {
      const tid='xyz'
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when :tid is negative', async () => {
      const tid=-5
      const auid=2
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when :tid is 0', async () => {
      const tid=-0
      const auid=3
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when body is absent', async () => {
      const tid=1
      const auid=4
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv is mandatory'})
        })
    })
    it('should reject 400 when body.rwlv is absent', async () => {
      const tid=1
      const uid=1
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv is mandatory'})
        })
    })
    it('should reject 400 when body.rwlv is not numeric', async () => {
      const tid=1
      const rwlv='xyz'
      const uid=1
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv must be 1 (read) or 3 (read and write)'})
        })
    })
    it('should reject 400 when body.rwlv is not 1 nor 3', async () => {
      const tid=1
      const rwlv=2
      const uid=1
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'rwlv must be 1 (read) or 3 (read and write)'})
        })
    })
    it('should reject 400 when body.uid is absent', async () => {
      const tid=1
      const rwlv=1
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid mandatory in the absence of email'})
        })
    })
    it('should reject 400 when body.uid is 0', async () => {
      const tid=1
      const rwlv=1
      const uid=0
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid has to be a positive integer'})
        })
    })
    it('should reject 400 when body.uid is same as auid', async () => {
      const tid=1
      const rwlv=1
      const uid=1
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'you cannot and need not change your own access'})
        })
    })
    it('should reject 400 when both body.uid and body.email are present', async () => {
      const tid=4
      const rwlv=3
      const uid=2
      const email='two@abc.com'
      const auid=2
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid should not be provided when email is specified'})
        })
    })
    it('should reject 400 when body.email is not a string', async () => {
      const tid=4
      const rwlv=3
      const auid=2
      const email=[]
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({email, rwlv})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'email should be a string'})
        })
    })
    it('should reject 400 when body.email is blank', async () => {
      const tid=4
      const rwlv=3
      const auid=2
      const email=' '
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({email, rwlv})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'email should not be blank'})
        })
    })
  })
  describe('4: PUT/actlq/:tid, input validation against database, negative test cases', () => {
    it('should return 202 that request has been queued when body.uid does not exist', async () => {
      const tid=1
      const rwlv=1
      const uid=5
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to change User_${uid} access to Todo_${tid} into ${rwlv===1?'read':'write'} queued`})
        })
    })
    it('should return 202 that request has been queued when Todo(:tid) does not exist', async () => {
      const tid=11
      const rwlv=1
      const uid=2
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to change User_${uid} access to Todo_${tid} into ${rwlv===1?'read':'write'} queued`})
        })
    })
    it('should return 202 that request has been queued when requesting User does not own Todo(:tid)', async () => {
      const tid=4
      const rwlv=1
      const uid=2
      const auid=1
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to change User_${uid} access to Todo_${tid} into ${rwlv===1?'read':'write'} queued`})
        })
    })
    it('should return 202 that request has been queued when body.email does not exist', async () => {
      const tid=4
      const rwlv=3
      const email='three@abcd.com'
      const auid=2
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to change User_${email} access to Todo_${tid} into ${rwlv===1?'read':'write'} queued`})
        })
    })
    it('should return 202 that request has been queued when body.email is same as requesting User', async () => {
      const tid=4
      const rwlv=3
      const email='two@abc.com'
      const auid=2
      return await request(app)
        .put(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to change User_${email} access to Todo_${tid} into ${rwlv===1?'read':'write'} queued`})
        })
    })
  })
  describe('5: DELETE/actlq/:tid, input validation before database, negative test cases', () => {
    it('should reject 400 when :tid not numeric', async () => {
      const tid='xyz'
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when :tid is negative', async () => {
      const tid=-5
      const auid=2
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when :tid is 0', async () => {
      const tid=-0
      const auid=3
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid has to be a positive integer'})
        })
    })
    it('should reject 400 when body is absent', async () => {
      const tid=1
      const auid=4
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid mandatory in the absence of email'})
        })
    })
    it('should reject 400 when body.uid is absent', async () => {
      const tid=1
      const rwlv=1
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid mandatory in the absence of email'})
        })
    })
    it('should reject 400 when body.uid is 0', async () => {
      const tid=1
      const rwlv=1
      const uid=0
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid has to be a positive integer'})
        })
    })
    it('should reject 400 when body.uid is same as auid', async () => {
      const tid=1
      const rwlv=1
      const uid=1
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'you cannot and need not delete your own access'})
        })
    })
    it('should reject 400 when both body.uid and body.email are present', async () => {
      const tid=4
      const rwlv=3
      const uid=2
      const email='two@abc.com'
      const auid=2
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email, uid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'uid should not be provided when email is specified'})
        })
    })
    it('should reject 400 when body.email is not a string', async () => {
      const tid=4
      const auid=2
      const email=true
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({email})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'email should be a string'})
        })
    })
    it('should reject 400 when body.email is blank', async () => {
      const tid=4
      const auid=2
      const email=' '
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({email})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'email should not be blank'})
        })
    })
  })
  describe('6: DELETE/actlq/:tid, input validation against database, negative test cases', () => {
    it('should return 202 that request has been queued when body.uid does not exist', async () => {
      const tid=1
      const rwlv=1
      const uid=5
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to delete User_${uid} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when Todo(:tid) does not exist', async () => {
      const tid=11
      const rwlv=1
      const uid=2
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to delete User_${uid} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when requesting User does not own Todo(:tid)', async () => {
      const tid=4
      const rwlv=1
      const uid=2
      const auid=1
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, uid})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to delete User_${uid} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when body.email does not exist', async () => {
      const tid=4
      const rwlv=3
      const email='three@abcd.com'
      const auid=2
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({rwlv, email})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to delete User_${email} access to Todo_${tid} queued`})
        })
    })
    it('should return 202 that request has been queued when body.email is same as requesting User', async () => {
      const tid=4
      const auid=2
      const email=utils.credentials[auid-1].username
      return await request(app)
        .delete(`/actlq/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({email})
        .expect(202)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} request to delete User_${email} access to Todo_${tid} queued`})
        })
    })
  })
})

describe('ACTLQ CUD Tests', () => {

  describe('1: POST/actlq/:tid to create Actls queued', () => {
    for (let idx=0;idx<utils.actls.length;idx++) {
      const i=idx
      it(`POST/ create request of Actl_${utils.actls[i].id} of ${utils.actls.length} queued successfully`, async () => {
        return await request(app)
          .post(`/actlq/${utils.actls[i].tid}`)
          .set('Authorization', utils.credentials[utils.todos[utils.actls[i].tid-1].uid-1].token)
          .send({uid: utils.actls[i].uid, rwlv: utils.actls[i].rwlv})
          .expect(202)
          .then(response => {
            expect(response.body)
              .toEqual({message: `User_${utils.todos[utils.actls[i].tid-1].uid} request to grant User_${utils.actls[i].uid} ${utils.actls[i].rwlv===1?'read':'write'} access to Todo_${utils.actls[i].tid} queued`})
          })
      })
    }
  })
})
