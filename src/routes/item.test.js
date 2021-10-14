// UNIT TEST for Items entry points
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
  utils.credentials[1].token = await utils.loginUser(utils.credentials[1].username, utils.credentials[1].password)
  utils.credentials[2].token = await utils.loginUser(utils.credentials[2].username, utils.credentials[2].password)
  utils.credentials[3].token = await utils.loginUser(utils.credentials[3].username, utils.credentials[3].password)

})

afterAll(async () => {
  //await utils.teardown()
})

describe('ITEM Unit Tests - set-up Todos', () => {

  describe('0: POST/todos to create Todos', () => {
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
})

describe('ITEM Unit Tests - negative test cases', () => {
  describe('1: POST/item, input validation, reject with a message', () => {
    it('should reject 400 when body is absent', async () => {
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'title is mandatory'})
        })
    })
    it('should reject 400 when title missing in body', async () => {
      const tid = 'xyz'
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({name: 'a name', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'title is mandatory'})
        })
    })
    it('should reject 400 when blank title in body', async () => {
      const tid = 'xyz'
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: ' ', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'title is mandatory'})
        })
    })
    //
    it('should reject 400 when body.tid is not nemeric', async () => {
      const tid = 'xyz'
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid should be a positive integer'})
        })
    })
    it('should reject 400 when body.tid is 0', async () => {
      const tid = 0
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid should be a positive integer'})
        })
    })
    it('should reject 400 when body.tid is negative', async () => {
      const tid = -6
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid should be a positive integer'})
        })
    })
    //
    it('should reject 404 when Todo_(body.tid) does not exist', async () => {
      const tid = 10
      const auid=1
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(404)
        .then(response => {
          expect(response.body)
            .toEqual({message: `Todo_${tid} does not exist`})
        })
    })
  })

  describe('2: PUT/item/:iid, input validation, reject with a message', () => {
    it('should reject 400 when param iid is non-numeric', async () => {
      const iid='xyz'
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: ':id has to be a positive integer'})
        })
    })
    it('should reject 400 when param iid is 0', async () => {
      const iid=0
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: ':id has to be a positive integer'})
        })
    })
    it('should reject 400 when param iid is negative', async () => {
      const iid=-5
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: ':id has to be a positive integer'})
        })
    })
    //
    it('should reject 400 when body is absent', async () => {
      const iid=1
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'you must provide a least one of title, completed, tid'})
        })
    })
    it('should reject 400 when body has none of the required data', async () => {
      const iid=1
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({name: 'name', age:10})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'you must provide a least one of title, completed, tid'})
        })
    })
    //
    it('should reject 400 when body.title is not string', async () => {
      const iid=1
      const tid=2
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 999, tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'title should be a string'})
        })
    })
    it('should reject 400 when body.title is blank', async () => {
      const iid=1
      const tid=2
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: ' ', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'title should not be blank'})
        })
    })
    //
    it('should reject 400 when body.tid is not nemeric', async () => {
      const iid=1
      const tid='xyz'
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', completed: true, tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid if provided, has to be a positive integer'})
        })
    })
    it('should reject 400 when body.tid is 0', async () => {
      const iid=1
      const tid=0
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid if provided, has to be a positive integer'})
        })
    })
    it('should reject 400 when body.tid is negative', async () => {
      const iid=1
      const tid=-5
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'tid if provided, has to be a positive integer'})
        })
    })
    //
    it('should reject 400 when body.completed is not boolean', async () => {
      const iid=1
      const tid='xyz'
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', completed: 'xyz', tid})
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'completed if provided, has to be a boolean'})
        })
    })
    it('should reject 404 when param iid does not exist', async () => {
      const iid=1
      const auid=1
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title'})
        .expect(404)
        .then(response => {
          expect(response.body)
            .toEqual({message: `Item_${iid} not found`})
        })
    })
  })

  describe('3: DELETE/item/:iid, input validation, reject with a message', () => {
    it('should reject 400 when param iid is non-numeric', async () => {
      const iid='xyz'
      const auid=1
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: ':id has to be a positive integer'})
        })
    })
    it('should reject 400 when param iid is 0', async () => {
      const iid=0
      const auid=1
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: ':id has to be a positive integer'})
        })
    })
    it('should reject 400 when param iid is negative', async () => {
      const iid=-5
      const auid=1
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: ':id has to be a positive integer'})
        })
    })
    it('should reject 404 when param iid does not exist', async () => {
      const iid = 1
      const auid=1
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(404)
        .then(response => {
          expect(response.body)
            .toEqual({message: `Item_${iid} not found`})
        })
    })
  })
})

describe('ITEM Unit Tests - creation and retrival', () => {
  describe('4: Create Items for Todos', () => {
    for (let idx=0;idx<utils.items.length;idx++) {
      const i=idx
      it(`should return 201 creating Item_${utils.items[i].id} of ${utils.items.length}`, async () => {
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
    const auid=4
    const tid=1
    it(`should retun 403 when user_${auid} creats Item for Todo_${tid} to which it has no access`, async () => {
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({tid, title: 'a title'})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual({message: `User_${auid} not authorised to add items to Todo_${tid}`})
        })
    })
  })

  describe('5: GET/todos/0 return todos with items, positive test cases', () => {
    for (let idx=0;idx<utils.credentials.length;idx++) {
      const auid=idx+1
      it(`GET/todos/0 should return todos with items created by user ${auid}`, async () => {
        let expected = JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid)))
        let status=200
        for (let j=0;j<expected.length;j++) {
          expected[j].items = JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected[j].id)))
        }
        if (expected.length===0) {
          expected={message: `User_${auid} has no accessible Todos`}
          status=403
        }
        return request(app)
          .get('/todos/0')
          .set('Authorization', utils.credentials[auid-1].token)
          .expect(status)
          .then(response => {
            expect(response.body)
              .toEqual(expected)
          })
      })
    }
  })

  describe('6: GET/todos/:tid return todo with items when requested by owner', () => {
    it('GET/todos/8 should return todo with items', async () => {
      const tid=8
      const auid=3
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      const status=200
      expected.items = JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todos/3 should return todo with empty items', async () => {
      const tid=3
      const auid=2
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      const status=200
      expected.items = JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
})

describe('ITEM Unit Tests - update Items to observe Todo ownership', () => {
  describe('7: PUT/items/:iid negative cases', () => {
    it('PUT/items/4 reject 403 when requested by non-owner User_1', async () => {
      const iid=4
      const tid=10
      const auid=1
      const expected = {message: `User_${auid} has no access to Todo_4 (current Todo of Item_4)`}
      const status=403
      return request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/items/4 reject 404 when requested by owner User_2 wanting to change to non-exist Todo_10', async () => {
      const iid=4
      const tid=10
      const auid=2
      const expected = {message: `Proposed Todo_${tid} not found`}
      const status=404
      return request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/items/4 reject 403 when requested by owner User_2 wanting to change to non-owned Todo_7', async () => {
      const iid=4
      const tid=7
      const auid=2
      const expected = {message: `User_${auid} has no write access to proposed Todo_${tid}`}
      const status=403
      return request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'this is a valid title', tid})
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('8: PUT/items/:iid positive cases', () => {
    it('PUT/items/4 by owner User_2 change title', async () => {
      const iid=4
      const auid=2
      const expected = JSON.parse(JSON.stringify(utils.items[iid-1]))
      const status=200
      expected.title = 'this is a new title'
      return request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/items/4 by owner User_2 change to completed', async () => {
      const iid=4
      const auid=2
      const expected = JSON.parse(JSON.stringify(utils.items[iid-1]))
      const status=200
      expected.title = 'this is a new title'
      expected.completed = true
      return request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title, completed: expected.completed})
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/items/4 by owner User_2 to switch to another Todo', async () => {
      const iid=4
      const tid=5
      const auid=2
      const expected = JSON.parse(JSON.stringify(utils.items[iid-1]))
      const status=200
      expected.title = 'yet another new title' // change title at the same time
      expected.completed = true
      expected.tid=tid
      return request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title, tid})
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todos/4 by owner User_2 returns less items', async () => {
      const tid=4
      const auid=2
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      const status=200
      expected.items = JSON.parse(JSON.stringify(utils.items.filter((item) => item.id!==4&&item.tid===expected.id)))
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todos/5 by owner User_2 returns one more item transferred from Todo_4', async () => {
      const tid=5
      const auid=2
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      const status=200
      expected.items = JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      const newItem = JSON.parse(JSON.stringify(utils.items[4-1]))
      // the following were updated in the few test case before this
      newItem.title = 'yet another new title'
      newItem.completed = true
      newItem.tid=tid
      expected.items.push(newItem)
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
})

describe('ITEM Unit Tests - delete Items to observe Todo ownership', () => {
  describe('7: DELETE/items/:iid negative cases', () => {
    const iid=9
    const auid=1
    const tid=utils.items[iid-1].tid
    it(`DELETE/items/${iid} reject 403 when requested by non-owner User_${auid}`, async () => {
      const expected = {message: `User_${auid} has no access to delete Item_${iid} of Todo_${tid}`}
      const status=403
      return request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('8: PUT/items/:iid positive cases', () => {
    const iid=9
    const auid=3
    it(`DELETE/items/${iid} by owner User_${auid} success`, async () => {
      const expected = JSON.parse(JSON.stringify(utils.items[iid-1]))
      const status=200
      return request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    const tid=utils.items[iid-1].tid
    it(`GET/todos/${tid} by owner User_${auid} returns less items`, async () => {
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      const status=200
      expected.items = JSON.parse(JSON.stringify(utils.items.filter((item) => item.id!==9&&item.tid===expected.id)))
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
})
