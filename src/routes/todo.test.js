const request = require('supertest')
const utils = require('../../tests/utils')

const app = utils.app
const db = utils.db

beforeAll(async () => {
  console.log('******** BEGIN Todos unit tests **** ')
  await utils.setup()
  utils.credentials[0].token = await utils.registerUser(utils.credentials[0].username, utils.credentials[0].password)
  utils.credentials[1].token = await utils.registerUser(utils.credentials[1].username, utils.credentials[1].password)
  utils.credentials[2].token = await utils.registerUser(utils.credentials[2].username, utils.credentials[2].password)
  utils.credentials[3].token = await utils.registerUser(utils.credentials[3].username, utils.credentials[3].password)

})

afterAll(async () => {
  //await utils.teardown()
  console.log('******** END   Todos unit tests **** ')
})


describe('POST /todos', () => {

  describe('1: POST/todos negative tests', () => {
    it('POST/todos should return 400 for body missing', async () => {
      const uid=1
      return await request(app)
        .post(`/todos`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: 'title is mandatory'})
        })
    })
    it('POST/todos should return 400 for body withuot title', async () => {
      const uid=1
      return await request(app)
      .post(`/todos`)
      .set('Authorization', utils.credentials[uid-1].token)
        .send({
          name: 'title'
        })
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: 'title is mandatory'})
        })
    })
    it('POST/todos should return 400 for body with blank title', async () => {
      const tid=10
      const uid=1
      return await request(app)
      .post(`/todos`)
      .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: ''
        })
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: 'title is mandatory'})
        })
    })
  })

  describe('2: POST/todos to create Todos in empty db', () => {
    for (idx=0;idx<utils.todos.length;idx++) {
      const id = idx+1;
      const tokenType = id<8?' reg':' login'
      it(`successful creation of Todo_${id} by User_${utils.todos[id-1].uid} using ${tokenType} token`, async () => {
        const auid=utils.todos[id-1].uid
        const expected = JSON.parse(JSON.stringify(utils.todos[id-1]))
        if (id===8) {utils.credentials[auid-1].token = await utils.loginUser(utils.credentials[auid-1].username, utils.credentials[auid-1].password)}
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

describe('GET /todos', () => {

  describe('1: GET/todos negative tests', () => {
    it('GET/todos/:tid should return 400 for non-numeric tid', async () => {
      const tid='xyz'
      const auid=1
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: ':id must be a non-negative integer'})
        })
    })
    it('GET/todos/-10 should return 400 for negative tid', async () => {
      const tid=-10
      const auid=1
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: ':id must be a non-negative integer'})
        })
    })
  })

  describe('2: GET/todos to return Todos belonging to requester', () => {
    for (idx=0;idx<utils.credentials.length;idx++) {
      const auid=idx+1
      it(`should return all todos created by user ${auid}`, async () => {
        let expected = JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid)))
        let status=200
        return request(app)
          .get('/todos')
          .set('Authorization', utils.credentials[auid-1].token)
          .expect(status)
          .then(response => {
            expect(response.body)
            .toEqual(expected)
          })
      })
    }
  })

  describe('3: GET/todos/:tid to return Todo or 404 or 403 accordingly', () => {
    it('should return 404 when non-existent Todo is targetted', async () => {
      const tid=11
      const auid=1
      const expected = {message: `Todo_${tid} not found`}
      const status=404
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
          .toEqual(expected)
        })
    })
    it('should return 403 when requester is not owner of Todo', async () => {
      const tid=3
      const auid=1
      const expected = {message: `User_${auid} not authorised to access Todo_${tid}`}
      const status=403
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
          .toEqual(expected)
        })
    })
    it('should return the Todo when requested by owner', async () => {
      const tid=3
      const auid=2
      const expected = JSON.parse(JSON.stringify(JSON.parse(JSON.stringify(utils.todos[tid-1]))))
      expected.items=[]
      const status=200
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
  
  describe('4: GET/todos/0 to return Todos or 403', () => {
    for (idx=0;idx<utils.credentials.length;idx++) {
      const auid=idx+1
      it(`should return ${auid<4?'all todos created by':'403 for'} User_${auid}${auid<4?'':' who owns no Todos'}`, async () => {
        const expected = auid<4
                ?JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid)))
                :{message: `User_${auid} has no accessible Todos`}
        if (auid<4) {
          for (j=0;j<expected.length;j++) {
            expected[j].items = []
          }
        }
        const status=auid<4?200:403
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
})

describe('PUT /todos', () => {

  describe('1: PUT/todos negative tests', () => {
    it('PUT/todos/xyz should return 400 for non-numeric tid', async () => {
      const tid='xyz'
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: 'title'
        })
        .expect(400)
    })
    it('PUT/todos/-10 should return 400 for negative tid', async () => {
      const tid=-10
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: 'title'
        })
        .expect(400)
    })
    it('PUT/todos/10 should return 400 for body missing', async () => {
      const tid=10
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(400)
    })
    it('PUT/todos/10 should return 400 for body withuot title', async () => {
      const tid=10
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          name: 'title'
        })
        .expect(400)
    })
    it('PUT/todos/10 should return 400 for body with blank title', async () => {
      const tid=10
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: ''
        })
        .expect(400)
    })
    it('PUT/todos/10 should return 404 for todo not exist', async () => {
      const tid=10
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: 'title'
        })
        .expect(404)
    })
    it('PUT/todos/5 by User_1 should return 403 for not authorised', async () => {
      const tid=5
      const uid=1
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: 'title'
        })
        .expect(403)
    })
  })

  describe('2: PUT/todos to allow changes by owner', () => {
    it('PUT/todos/1 should return 200 when provided with same title', async () => {
      const tid=1
      const uid=1
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      const title=expected.title
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: title
        })
        .expect(200)
        .then(response => {
          expect(response.body)
          .toEqual(expected)
        })
    })
    it('PUT/todos/1 should return 200 when updated with new title', async () => {
      const tid=1
      const uid=1
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.title=`${expected.title} new title`
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .send({
          title: expected.title
        })
        .expect(200)
        .then(response => {
          expect(response.body)
          .toEqual(expected)
        })
    })
  })

})

describe('DELETE /todos', () => {

  describe('1: DELETE/todos negative tests', () => {
    it('DELETE/todos/xyz should return 400 for non-numeric tid', async () => {
      const tid='xyz'
      const uid=1
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: ':id has to be a positive number'})
        })
    })
    it('DELETE/todos/-10 should return 400 for negative tid', async () => {
      const tid=-10
      const uid=1
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: ':id has to be a positive number'})
        })
    })
    it('DELETE/todos/0 should return 400 for zero tid', async () => {
      const tid=-10
      const uid=1
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(400)
        .then(response => {
          expect(response.body)
          .toEqual({message: ':id has to be a positive number'})
        })
    })
    it('DELETE/todos/10 should return 404 non-existent Todo_10', async () => {
      const tid=10
      const uid=1
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(404)
        .then(response => {
          expect(response.body)
          .toEqual({message: `Todo_${tid} not found`})
        })
    })
    it('DELETE/todos/9 by non-owner should return 403', async () => {
      const tid=9
      const auid=1
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(403)
        .then(response => {
          expect(response.body)
          .toEqual({message: `User_${auid} not authorised to delete Todo_${tid}`})
        })
    })
  })

  describe('2: DELETE/todos by owner allowed', () => {
    it('DELETE/todos/3 should return 200 with record as before deletion', async () => {
      const tid=3
      const uid=2
      const expected = JSON.parse(JSON.stringify(utils.todos[tid-1]))
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[uid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
          .toEqual(expected)
        })
    })
  })


})