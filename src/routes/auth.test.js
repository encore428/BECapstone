//npm test tests/test_suites/auth.unit.test
//const { response } = require('express')
const request = require('supertest')
const utils = require('../../tests/utils')

const app = utils.app
//const app='https://todoitem.herokuapp.com/'
//const db = utils.db1


beforeAll(async () => {
  console.log('******** BEGIN unit tests for auth **** ')
  await utils.setup()
})

afterAll(async () => {
  //await utils.teardown()
  console.log('******** END unit tests for auth **** ')
})

describe('AUTH Unit test', () => {

  describe('1: All unauthenticated access should be rejected except for GET/', () => {
    it('GET/ should return 200 with a welcome message', async () => {
      return request(app)
        .get('/')
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'Welcome to Todo API!'})
        })
    })
    //
    // todos
    it('GET/todos         should reject with 401 and a message', async () => {
      return await request(app)
        .get('/todos')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('GET/todos/0       should reject with 401 and a message', async () => {
      return await request(app)
        .get('/todos/0')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('GET/todos/:tid    should reject with 401 and a message', async () => {
      return await request(app)
        .get('/todos/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('POST/todos        should reject with 401 and a message', async () => {
      return await request(app)
        .post('/todos')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('PUT/todos/:tid    should reject with 401 and a message', async () => {
      return await request(app)
        .put('/todos/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('DELETE/todos/:tid should reject with 401 and a message', async () => {
      return await request(app)
        .delete('/todos/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    //
    // items
    it('POST/items should reject with 401 with a message', async () => {
      return await request(app)
        .post('/items')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('PUT/items/:tid should reject with 401 with a message', async () => {
      return await request(app)
        .put('/items/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('DELETE/items/:tid should reject with 401 with a message', async () => {
      return await request(app)
        .delete('/items/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    //
    // actls
    it('POST/actls/:tid should reject with 401 with a message', async () => {
      return await request(app)
        .post('/actls/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('PUT/actls/:tid should reject with 401 with a message', async () => {
      return await request(app)
        .put('/actls/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
    it('DELETE/actls/:tid should reject with 401 with a message', async () => {
      return await request(app)
        .delete('/actls/1')
        .expect(401)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'User is not authenticated'})
        })
    })
  })


  describe('2: POST/register and POST/login', () => {
    //
    // register
    it('/register without username/password should return 400 with message', async () => {
      return request(app)
        .post('/register')
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'username missing'})
        })
    })
    it('/register without username should return 400 with message', async () => {
      return request(app)
        .post('/register')
        .send({ password: utils.credentials[0].password })
        .then(response => {
          expect(response.body)
            .toEqual({message: 'username missing'})
        })
    })
    it('/register without password should return 400 with message', async () => {
      return request(app)
        .post('/register')
        .send({ username: utils.credentials[0].username })
        .then(response => {
          expect(response.body)
            .toEqual({message: 'password missing'})
        })
    })
    it('/register with new user/password should return a token', async () => {
      return request(app)
        .post('/register')
        .send({ username: utils.credentials[0].username, password: utils.credentials[0].password })
        .expect(200)
        .then(response => {
          expect(response.body.token).toBeTruthy()
        })
    })
    it('/register with existing user/password should return 400 with message', async () => {
      return request(app)
        .post('/register')
        .send({ username: utils.credentials[0].username, password: utils.credentials[0].password })
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: `Username ${utils.credentials[0].username} already exists`})
        })
    })
    //
    // login
    it('/login without username/password should return 400 with message', async () => {
      return request(app)
        .post('/login')
        .expect(400)
        .then(response => {
          expect(response.body)
            .toEqual({message: 'username missing'})
        })
    })
    it('/login without username should return 400 with message', async () => {
      return request(app)
        .post('/login')
        .send({ password: utils.credentials[0].password })
        .then(response => {
          expect(response.body)
            .toEqual({message: 'username missing'})
        })
    })
    it('/login without password should return 400 with message', async () => {
      return request(app)
        .post('/login')
        .send({ username: utils.credentials[0].username })
        .then(response => {
          expect(response.body)
            .toEqual({message: 'password missing'})
        })
    })
    it('/login with wrong user should return 400 with message', async () => {
      return request(app)
        .post('/login')
        .send({ username: 'nosuchuser', password: utils.credentials[0].password })
        .then(response => {
          expect(response.body)
            .toEqual({message: 'Invalid login credentials'})
        })
    })
    it('/login with wrong password should return 400 with message', async () => {
      return request(app)
        .post('/login')
        .send({ username: utils.credentials[0].username, password: 'wrong_password' })
        .then(response => {
          expect(response.body)
            .toEqual({message: 'Invalid login credentials'})
        })
    })
    it('/login with valid username/password should return a token', async () => {
      return request(app)
        .post('/login')
        .send({ username: utils.credentials[0].username, password: utils.credentials[0].password })
        .expect(200)
        .then(response => {
          expect(response.body.token).toBeTruthy()
        })
    })  
  })
})
