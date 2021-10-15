# Full test automation coverage

Testing of API is very labor intensive.  The jest library provdies an automation tool very suitable for testing API.  So 
instead of conducting tests with PostMan, all tests are programmed into five unit test scripts `xxxx.test.js`, and one
integration test script `int.test.js`.

All unit tests include negative test cases to exhaust all imagineable input and error situations.

**`auth.test.js`**

Tests the user registration and login process, and verifies that all other end-points are rejected if not authendicated.

**`todo.test.js`**

Tests CRUD of Todos.  The test cases are base on the ownership of each Todo and without consideration of the effect 
of access control records.  Ownership means that a Todo record is only accessible to it's owner, and owner is the user 
who created that Todo record.

**`items.test.js`**

Tests CUD of Items, which must be related to Todos.  Like Todo test, the test cases are based only on ownership
of Todos. 

**`actl.test.js`**

Tests CUD of Actls (access control records).

**`int.test.js`**

Conducts the integration test.  It repeats many of the tests earlier, but this time the full effect of access control is verified.

**`actlq.test.js`**

This is modeled from `actl.test.js` to repeat all the validation fail test cases, as well as a few POST test cases.  Due to
the delayed update by the event-driven approah, the full test results, as well as some test cases that involved updates, 
have to be conducted manually.


# Test coverage

`npm test` will execute all six test files to generate the following coverage report.


File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |   98.22 |    97.47 |   95.89 |   98.18 |
 src             |     100 |      100 |     100 |     100 |
  app.js         |     100 |      100 |     100 |     100 |
 src/db          |   94.64 |     93.2 |      92 |   94.44 |
  actls.js       |     100 |       90 |     100 |     100 | 61,90
  index.js       |   71.79 |       50 |   71.42 |   71.79 | 6,28-68,94-95
  items.js       |   98.98 |    98.18 |     100 |   98.91 | 116
  todos.js       |     100 |    85.71 |     100 |     100 | 46,66
  users.js       |     100 |      100 |     100 |     100 |
 src/middlewares |     100 |    83.33 |     100 |     100 |
  auth.js        |     100 |    83.33 |     100 |     100 | 7
 src/models      |     100 |      100 |     100 |     100 |
  actl.js        |     100 |      100 |     100 |     100 |
  item.js        |     100 |      100 |     100 |     100 |
  todo.js        |     100 |      100 |     100 |     100 |
  user.js        |     100 |      100 |     100 |     100 |
 src/routes      |     100 |    99.36 |     100 |     100 |
  actlq.js       |     100 |      100 |     100 |     100 |
  actls.js       |     100 |    98.24 |     100 |     100 | 189,268
  auth.js        |     100 |      100 |     100 |     100 |
  index.js       |     100 |      100 |     100 |     100 |
  items.js       |     100 |      100 |     100 |     100 |
  todos.js       |     100 |      100 |     100 |     100 |
 src/services    |   97.82 |       90 |     100 |   97.82 |
  amqp.js        |     100 |       75 |     100 |     100 | 5
  auth.js        |   96.77 |      100 |     100 |   96.77 | 44
 tests           |   96.87 |      100 |      80 |   96.87 |
  utils.js       |   96.87 |      100 |      80 |   96.87 | 60
```
Test Suites: 6 passed, 6 total
Tests:       380 passed, 380 total
Snapshots:   0 total
Time:        11.109 s
```

Since both `/actls` and `/actlq` endpoints use the same `db.updateActls()` for secondary validation and database update, full repeat of `/actls` endpoint test cases on
`/actlq` end point is not necessary.  However, if it is desired to conduct on `/actlq` endpoint those test cases in `actl.test.js` but not in `actlq.test.js`,
one can repeat `npm test src/routes/acltq.test`, to be followed by those skipped test cases using POSTMAN.

# Test Script Design

**Common test data set**

A deliberately designed common set of test data is used as the basis for all tests:
```js
utils.credentials = [
  { username: 'one@abc.com', password: '1234', token: '' },
  { username: 'two@abc.com', password: '1234', token: '' },
  { username: 'three@abc.com', password: '3456', token: '' },
  { username: 'four@abc.com', password: '1234', token: '' }
]

utils.todos = [
  { id: 1, title: `Todo_1 created by ${utils.credentials[1-1].username}`, uid: 1},
  { id: 2, title: `Todo_2 created by ${utils.credentials[1-1].username}`, uid: 1},
  { id: 3, title: `Todo_3 created by ${utils.credentials[2-1].username}`, uid: 2},
  { id: 4, title: `Todo_4 created by ${utils.credentials[2-1].username}`, uid: 2},
  { id: 5, title: `Todo_5 created by ${utils.credentials[2-1].username}`, uid: 2},
  { id: 6, title: `Todo_6 created by ${utils.credentials[3-1].username}`, uid: 3},
  { id: 7, title: `Todo_7 created by ${utils.credentials[3-1].username}`, uid: 3},
  { id: 8, title: `Todo_8 created by ${utils.credentials[3-1].username}`, uid: 3},
  { id: 9, title: `Todo_9 created by ${utils.credentials[3-1].username}`, uid: 3}
]

utils.actls = [
  { id:  1, tid:5, uid: 3, rwlv:3},
  { id:  2, tid:5, uid: 4, rwlv:1},
  { id:  3, tid:5, uid: 1, rwlv:1}
]

utils.items = [
  { id:  1, title: `Item_1 of Todo_1 created by ${utils.credentials[1-1].username}`, completed: false, tid:1, uid: 1},
  { id:  2, title: `Item_2 of Todo_5 created by ${utils.credentials[2-1].username}`, completed: false, tid:5, uid: 2},
  { id:  3, title: `Item_3 of Todo_4 created by ${utils.credentials[2-1].username}`, completed: false, tid:4, uid: 2},
  { id:  4, title: `Item_4 of Todo_4 created by ${utils.credentials[2-1].username}`, completed: false, tid:4, uid: 2},
  { id:  5, title: `Item_5 of Todo_7 created by ${utils.credentials[3-1].username}`, completed: false, tid:7, uid: 3},
  { id:  6, title: `Item_6 of Todo_7 created by ${utils.credentials[3-1].username}`, completed: false, tid:7, uid: 3},
  { id:  7, title: `Item_7 of Todo_8 created by ${utils.credentials[3-1].username}`, completed: false, tid:8, uid: 3},
  { id:  8, title: `Item_8 of Todo_8 created by ${utils.credentials[3-1].username}`, completed: false, tid:8, uid: 3},
  { id:  9, title: `Item_9 of Todo_9 created by ${utils.credentials[3-1].username}`, completed: false, tid:9, uid: 3},
  { id: 10, title: `Item_10 of Todo_9 created by ${utils.credentials[3-1].username}`, completed: false, tid:9, uid: 3}
]

```

**Return Message and Data are checked**

Both return code and return messages are checked:

```js
    it('POST/todos should return 400 for body withuot title', async () => {
      const uid=1
      return await request(app)
        .post('/todos')
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

```

Both return code and results in JSON format are checked:
```js
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

```

**Structured and Comprehensive Test Scripts**

```
 PASS  src/routes/actlq.test.js
  ACTLQ Unit Tests: test data preparations
    1: POST/todos to create Todos
      √ successful creation of Todo_1 by User_1 using login token (110 ms)
      √ successful creation of Todo_2 by User_1 using login token (10 ms)
      √ successful creation of Todo_3 by User_2 using login token (7 ms)
      √ successful creation of Todo_4 by User_2 using login token (9 ms)
      √ successful creation of Todo_5 by User_2 using login token (7 ms)
      √ successful creation of Todo_6 by User_3 using login token (7 ms)
      √ successful creation of Todo_7 by User_3 using login token (7 ms)
      √ successful creation of Todo_8 by User_3 using login token (7 ms)
      √ successful creation of Todo_9 by User_3 using login token (7 ms)
    2: POST/takks to create Items
      √ Create Item_1 of 10 (9 ms)
      √ Create Item_2 of 10 (7 ms)
      √ Create Item_3 of 10 (6 ms)
      √ Create Item_4 of 10 (8 ms)
      √ Create Item_5 of 10 (7 ms)
      √ Create Item_6 of 10 (7 ms)
      √ Create Item_7 of 10 (7 ms)
      √ Create Item_8 of 10 (8 ms)
      √ Create Item_9 of 10 (7 ms)
      √ Create Item_10 of 10 (7 ms)
  ACTLQ Validate Tests
    1: POST/actlq/:tid, input validation before database, negative test cases
      √ should reject 400 when :tid not numeric (7 ms)
      √ should reject 400 when :tid is negative (7 ms)
      √ should reject 400 when :tid is 0 (9 ms)
      √ should reject 400 when body is absent (7 ms)
      √ should reject 400 when body.rwlv is absent (7 ms)
      √ should reject 400 when body.rwlv is not numeric (6 ms)
      √ should reject 400 when body.rwlv is not 1 nor 3 (6 ms)
      √ should reject 400 when body.uid is absent (6 ms)
      √ should reject 400 when body.uid is 0 (6 ms)
      √ should reject 400 when body.uid is same as auid (7 ms)
      √ should reject 400 when both body.uid and body.email are present (5 ms)
      √ should reject 400 when both body.email not a string (6 ms)
      √ should reject 400 when body.email is blank (5 ms)
    2: POST/actlq/:tid, input validation against database, negative test cases
      √ should return 202 that request has been queued when body.uid does not exist (54 ms)
      √ should reject 202 that request has been queued when Todo(:tid) does not exist (31 ms)
      √ should return 202 that request has been queued when requesting User does not own Todo(:tid) (29 ms)
      √ should return 202 that request has been queued when body.email does not exist (48 ms)
      √ should return 202 that request has been queued when body.email is same as requesting User (32 ms)
    3: PUT/actlq/:tid, input validation before database, negative test cases
      √ should reject 400 when :tid not numeric (6 ms)
      √ should reject 400 when :tid is negative (8 ms)
      √ should reject 400 when :tid is 0 (6 ms)
      √ should reject 400 when body is absent (7 ms)
      √ should reject 400 when body.rwlv is absent (7 ms)
      √ should reject 400 when body.rwlv is not numeric (7 ms)
      √ should reject 400 when body.rwlv is not 1 nor 3 (7 ms)
      √ should reject 400 when body.uid is absent (12 ms)
      √ should reject 400 when body.uid is 0 (5 ms)
      √ should reject 400 when body.uid is same as auid (7 ms)
      √ should reject 400 when both body.uid and body.email are present (6 ms)
      √ should reject 400 when body.email is not a string (6 ms)
      √ should reject 400 when body.email is blank (7 ms)
    4: PUT/actlq/:tid, input validation against database, negative test cases
      √ should return 202 that request has been queued when body.uid does not exist (27 ms)
      √ should return 202 that request has been queued when Todo(:tid) does not exist (27 ms)
      √ should return 202 that request has been queued when requesting User does not own Todo(:tid) (29 ms)
      √ should return 202 that request has been queued when body.email does not exist (30 ms)
      √ should return 202 that request has been queued when body.email is same as requesting User (29 ms)
    5: DELETE/actlq/:tid, input validation before database, negative test cases
      √ should reject 400 when :tid not numeric (8 ms)
      √ should reject 400 when :tid is negative (7 ms)
      √ should reject 400 when :tid is 0 (5 ms)
      √ should reject 400 when body is absent (10 ms)
      √ should reject 400 when body.uid is absent (6 ms)
      √ should reject 400 when body.uid is 0 (8 ms)
      √ should reject 400 when body.uid is same as auid (5 ms)
      √ should reject 400 when both body.uid and body.email are present (5 ms)
      √ should reject 400 when body.email is not a string (6 ms)
      √ should reject 400 when body.email is blank (6 ms)
    6: DELETE/actlq/:tid, input validation against database, negative test cases
      √ should return 202 that request has been queued when body.uid does not exist (28 ms)
      √ should return 202 that request has been queued when Todo(:tid) does not exist (31 ms)
      √ should return 202 that request has been queued when requesting User does not own Todo(:tid) (31 ms)
      √ should return 202 that request has been queued when body.email does not exist (29 ms)
      √ should return 202 that request has been queued when body.email is same as requesting User (31 ms)
  ACTLQ CUD Tests
    1: POST/actlq/:tid to create Actls queued
      √ POST/ create request of Actl_1 of 3 queued successfully (28 ms)
      √ POST/ create request of Actl_2 of 3 queued successfully (29 ms)
      √ POST/ create request of Actl_3 of 3 queued successfully (29 ms)
```

The following log is observed at the worker console.
```
[INFO] retrived from actlq: { actl: { tid: 1, uid: 5, rwlv: 1 }, auid: 1, reqType: 'post' }
[VALIDATION] User_5 does not exist

[INFO] retrived from actlq: { actl: { tid: 11, uid: 2, rwlv: 1 }, auid: 1, reqType: 'post' }
[VALIDATION] Todo_11 does not exist

[INFO] retrived from actlq: { actl: { tid: 4, uid: 2, rwlv: 1 }, auid: 1, reqType: 'post' }
[VALIDATION] User_1 does not own Todo_4

[INFO] retrived from actlq: {       
  actl: { tid: 4, uid: 0, rwlv: 3 },
  auid: 2,
  email: 'three@abcd.com',
  reqType: 'post'
}
[VALIDATION] User_three@abcd.com does not exist

[INFO] retrived from actlq: {
  actl: { tid: 4, uid: 0, rwlv: 3 },
  auid: 2,
  email: 'two@abc.com',
  reqType: 'post'
}
[VALIDATION] you need not create your own access

[INFO] retrived from actlq: { actl: { tid: 1, uid: 5, rwlv: 1 }, auid: 1, reqType: 'put' }
[VALIDATION] User_5 does not exist


[INFO] retrived from actlq: { actl: { tid: 11, uid: 2, rwlv: 1 }, auid: 1, reqType: 'put' }
[VALIDATION] Todo_11 does not exist

[INFO] retrived from actlq: { actl: { tid: 4, uid: 2, rwlv: 1 }, auid: 1, reqType: 'put' }
[VALIDATION] User_1 does not own Todo_4

[INFO] retrived from actlq: {
  actl: { tid: 4, uid: 0, rwlv: 3 },
  auid: 2,
  email: 'three@abcd.com',
  reqType: 'put'
}
[VALIDATION] User_three@abcd.com does not exist

[INFO] retrived from actlq: {
  actl: { tid: 4, uid: 0, rwlv: 3 },
  auid: 2,
  email: 'two@abc.com',
  reqType: 'put'
}
[VALIDATION] you need not create your own access

[INFO] retrived from actlq: { actl: { tid: 1, uid: 5, rwlv: 0 }, auid: 1, reqType: 'delete' }
[VALIDATION] User_5 does not exist

[INFO] retrived from actlq: { actl: { tid: 11, uid: 2, rwlv: 0 }, auid: 1, reqType: 'delete' }
[VALIDATION] Todo_11 does not exist

[INFO] retrived from actlq: { actl: { tid: 4, uid: 2, rwlv: 0 }, auid: 1, reqType: 'delete' }
[VALIDATION] User_1 does not own Todo_4

[INFO] retrived from actlq: {
  actl: { tid: 4, uid: 0, rwlv: 0 },
  auid: 2,
  email: 'three@abcd.com',
  reqType: 'delete'
}
[VALIDATION] User_three@abcd.com does not exist

[INFO] retrived from actlq: {
  actl: { tid: 4, uid: 0, rwlv: 0 },
  auid: 2,
  email: 'two@abc.com',
  reqType: 'delete'
}
[VALIDATION] you need not create your own access

[INFO] retrived from actlq: { actl: { tid: 5, uid: 3, rwlv: 3 }, auid: 2, reqType: 'post' }
[SUCCESS] post completed: {"id":1,"tid":5,"uid":3,"rwlv":3}

[INFO] retrived from actlq: { actl: { tid: 5, uid: 4, rwlv: 1 }, auid: 2, reqType: 'post' }
[SUCCESS] post completed: {"id":2,"tid":5,"uid":4,"rwlv":1}

[INFO] retrived from actlq: { actl: { tid: 5, uid: 1, rwlv: 1 }, auid: 2, reqType: 'post' }
[SUCCESS] post completed: {"id":3,"tid":5,"uid":1,"rwlv":1}

```
