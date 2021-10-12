const request = require('supertest')
const { db } = require('./utils')
const utils = require('./utils')

const app = utils.app

beforeAll(async () => {
  console.log('******** BEGIN integration tests **** ')
  await utils.setup()
  for (let i=0;i<utils.credentials.length;i++) {
    utils.credentials[i].token = await utils.registerUser(utils.credentials[i].username, utils.credentials[i].password)
  }

})

afterAll(async () => {
  await utils.teardown()
  console.log('******** END   integration tests **** ')
})


describe('Test database set-up', () => {
  describe('1: POST/todos to create Todos', () => {
    for (let idx=0;idx<utils.todos.length;idx++) {
      const id=idx+1
      it(`successful creation of Todo_${id} by User_${utils.todos[id-1].uid} using login token`, async () => {
        const auid=utils.todos[id-1].uid
        const expected=JSON.parse(JSON.stringify(utils.todos[id-1]))
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
  describe('2: POST/toaks to create Items', () => {
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
  describe('3: POST/actls/:tid to create Actls', () => {
    // note the the last utils.actl is not created.
    // note this creation uses email instead of uid of the grantee
    for (let idx=0;idx<utils.actls.length-1;idx++) {
      const i=idx
      it(`POST/ creates Actl_${utils.actls[i].id} of ${utils.actls.length-1} successfully`, async () => {
        return await request(app)
          .post(`/actls/${utils.actls[i].tid}`)
          .set('Authorization', utils.credentials[utils.todos[utils.actls[i].tid-1].uid-1].token)
          .send({email: utils.credentials[utils.actls[i].uid-1].username, rwlv: utils.actls[i].rwlv})
          .expect(201)
          .then(response => {
            expect(response.body)
              .toEqual(utils.actls[i])
          })
      })
    }
  })
})
describe('GET/todos to observe actls', () => {
  describe('1: GET/Todos to observe Actls', () => {
    for (let idx=0;idx<utils.credentials.length;idx++) {
      const auid=idx+1
      it(`GET/todos should return all todos accessible to user ${auid}`, async () => {
        const expected=JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid||((auid===3)||(auid===4))&&(todo.id===5))))
        const status=200
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
  describe('2: GET/Todos/0 to observe Actls', () => {
    for (let idx=0;idx<utils.credentials.length;idx++) {
      const auid=idx+1
      it(`GET/todos/0 should return all todos with items accessible to user ${auid}`, async () => {
        let expected=JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid||((auid===3)||(auid===4))&&(todo.id===5))))
        let status=200
        for (let j=0;j<expected.length;j++) {
          expected[j].items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected[j].id)))
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
  describe('3: GET/Todos/:id to observe Actls', () => {
    it('GET/todos/5 should return 403 to User_1 who has no access', async () => {
      const tid=5
      const auid=1
      let status=403
      const expected={message: `User_${auid} not authorised to access Todo_${tid}`}
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todos/5 should return todo with items to User_2 who is the owner', async () => {
      const tid=5
      const auid=2
      const status=200
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      return request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(status)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todos/5 should return todo with items to User_3 who has been granted write access', async () => {
      const tid=5
      const auid=3
      const status=200
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
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
describe('DELETE/items,todos to observe actls, negative test cases', () => {
  describe('1: DELETE/todos requires owner or write access', () => {
    it('DELETE/ reject 403 for non-owner with no access', async () => {
      const auid=2
      const tid=9
      const expected={message: `User_${auid} not authorised to delete Todo_${tid}`}
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/ reject 403 for non-owner with read-only access', async () => {
      const auid=4
      const tid=5
      const expected={message: `User_${auid} not authorised to delete Todo_${tid}`}
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('1: DELETE/items requires Todo owner or write access', () => {
    it('DELETE/ reject 403 for non-owner with no access', async () => {
      const auid=2
      const iid=10
      const tid=utils.items[iid-1].tid
      const expected={message: `User_${auid} has no access to delete Item_${iid} of Todo_${tid}`}
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/ reject 403 for non-owner with read-only access', async () => {
      const auid=4
      const iid=2
      const tid=utils.items[iid-1].tid
      const expected={message: `User_${auid} has no access to delete Item_${iid} of Todo_${tid}`}
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })

})

describe('PUT/todos to observe actls', () => {
  describe('1: PUT/todos/:tid success for owner and user with write access', () => {
    it('PUT/ success for owner', async () => {
      const tid=1
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.title=`a new title for Todo_${tid}`
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ success for non-owner having write access', async () => {
      const tid=5
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.title=`a new title for Todo_${tid}`
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('2: PUT/todos rejects users who has no access', () => {
    it('PUT/ fail with 403 for non-owner having only read access', async () => {
      const tid=5
      const auid=4
      const expected={message: `User_${auid} not authorised to update Todo_${tid}`}
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'title will not be updated'})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ fail with 403 for non-owner with no actls', async () => {
      const tid=5
      const auid=1
      const expected={message: `User_${auid} not authorised to update Todo_${tid}`}
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'title will not be updated'})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('3: GET/todos to verify update success of this test block so far', () => {
    it('GET/ to verify todo 1 has been updated', async () => {
      const tid=1
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      expected.title=`a new title for Todo_${tid}`
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/ to verify todo 5 has been updated', async () => {
      const tid=5
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      expected.title=`a new title for Todo_${tid}`
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ to revert changes to Todo_1', async () => {
      const tid=1
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ to revert changes to Todo_5', async () => {
      const tid=5
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      return await request(app)
        .put(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
})

describe('POST,PUT/items to observe actls', () => {
  describe('1: POST requires owner or write access', () => {
    it('POST/ reject 403 for non-owner with no access', async () => {
      const tid=5
      const auid=1
      const expected={message: `User_${auid} not authorised to add items to Todo_${tid}`}
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'new item', tid})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('POST/ reject 403 for non-owner with read access only', async () => {
      const tid=5
      const auid=4
      const expected={message: `User_${auid} not authorised to add items to Todo_${tid}`}
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'new item', tid})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    let item11
    it('POST/ success for non-owner with write access', async () => {
      const id=11
      const tid=5
      const auid=3
      const expected={ id, completed: false, tid, uid: auid }
      expected.title=`Item_${id} of Todo_${tid} created by ${utils.credentials[auid-1].username}`
      item11=expected
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title, tid})
        .expect(201)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    let item12
    it('POST/ success for owner', async () => {
      const id=12
      const tid=5
      const auid=2
      const expected={ id, completed: false, tid, uid: auid }
      expected.title=`Item_${id} of Todo_${tid} created by ${utils.credentials[auid-1].username}`
      item12=expected
      return await request(app)
        .post('/items')
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title, tid})
        .expect(201)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todo/5 to verify above test cases successful', async () => {
      const tid=5
      const auid=2
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      expected.items.push(item11)
      expected.items.push(item12)
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/items/11 to revert database status', async () => {
      const iid=11
      const auid=2
      const expected=item11
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/items/12 to revert database status', async () => {
      const iid=12
      const auid=2
      const expected=item12
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('2: PUT allowed to owner as well as read or write access', () => {
    it('PUT/ reject 403 for non-owner with no access', async () => {
      const iid=1
      const auid=2
      const expected={message: `User_${auid} has no access to Todo_${utils.items[iid-1].tid} (current Todo of Item_${iid})`}
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: 'new title'})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ success for non-owner with read access only', async () => {
      const iid=2
      const auid=4
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      expected.title='new title'
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ success for non-owner with write access', async () => {
      const iid=2
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      expected.title='new title'
      expected.completed=true
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({completed: expected.completed})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todo/5 to verify above two test cases successful', async () => {
      const tid=5
      const auid=2
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      expected.items[0].title='new title'
      expected.items[0].completed=true
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ success for owner', async () => {
      const iid=2
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      expected.title='another title'
      expected.completed=true
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({title: expected.title})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todo/5 using a read-only non-owner user to verify above test case successful', async () => {
      const tid=5
      const auid=4
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      expected.items[0].title='another title'
      expected.items[0].completed=true
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ to revert table changes in this test block', async () => {
      const iid=2
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send(expected)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('3: PUT item transfer rejected when requester has no write access to both bef/aft tid', () => {
    it('PUT/ reject 403 when user transfers Item from own Todo to a Todo with no access', async () => {
      const iid=2
      const auid=2
      const tid=1
      const expected={message: `User_${auid} has no write access to proposed Todo_${tid}`}
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({tid})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('Prep for next test case: Owner User_2 of Todo_5 to create a read access for User_1 first', async () => {
      const tid=5
      const auid=2
      const uid=1
      const actls={id: 3, tid, uid, rwlv: 1}
      return await request(app)
        .post(`/actls/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({uid, rwlv: 1})
        .expect(201)
        .then(response => {
          expect(response.body)
            .toEqual(actls)
        })
    })
    it('PUT/ reject 403 when User_1 transfers Item_1 (of own Todo_1) to read-only Todo_5', async () => {
      const iid=1
      const auid=1
      const tid=5
      const expected={message: `User_${auid} has no write access to proposed Todo_${tid}`}
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({tid})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('PUT/ reject 403 when user transfers item from read-only Todo to own Todo', async () => {
      const auid=1
      const tid=2
      const iid=2
      const expected={message: `User_${auid} has no write access to Todo_${utils.items[iid-1].tid} (current Todo of Item_${iid})`}
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({tid})
        .expect(403)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/actls the one record created above to revert database', async () => {
      const aid=3
      const tid=utils.actls[aid-1].tid
      const auid=utils.todos[utils.actls[aid-1].tid-1].uid
      const uid=utils.actls[aid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.actls[aid-1]))
      return await request(app)
        .delete(`/actls/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({uid})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('4: PUT item transfer successes', () => {
    let item8
    it('PUT/ success when user transfers Item from own Todo to another own Todo', async () => {
      const iid=8
      const frTid=utils.items[iid-1].tid
      const auid=utils.todos[frTid-1].uid
      const tid=9
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      expected.tid=tid
      item8=JSON.parse(JSON.stringify(expected))
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({tid})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    let item6
    it('PUT/ success when user transfers Item from own Todo to writable Todo', async () => {
      const auid=3
      const tid=5
      const iid=6
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      expected.tid=tid
      item6=JSON.parse(JSON.stringify(expected))
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send({tid})
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('Add one more Actls for next test case', async () => {
      const tid=2
      const auid=utils.todos[tid-1].uid
      const uid=3
      const actls={id: 4, tid, uid, rwlv: 3}
      return await request(app)
        .post(`/actls/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send(actls)
        .expect(201)
        .then(response => {
          expect(response.body)
            .toEqual(actls)
        })
    })
    let item2
    it('PUT/ success when user transfers Item from writable Todo to another writable Todo', async () => {
      const auid=3
      const iid=2
      const tid=2
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      expected.tid=tid
      expected.completed=true
      expected.title='another title'
      item2=JSON.parse(JSON.stringify(expected))
      return await request(app)
        .put(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .send(expected)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todo/9 to verify above test cases successful', async () => {
      const tid=9
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => ((item.tid===expected.id)||(item.id===8)))))
      expected.items[0]=item8
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todo/5 to verify above test cases successful', async () => {
      const tid=5
      const auid=4
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => ((item.tid===expected.id)&&(item.id!==2)))))
      expected.items.push(item6)
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('GET/todo/2 to verify above test cases successful', async () => {
      const tid=2
      const auid=1
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      expected.items=JSON.parse(JSON.stringify(utils.items.filter((item) => item.tid===expected.id)))
      expected.items.push(item2)
      return await request(app)
        .get(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
})

describe('DELETE/todos,items success for owners and write-access', () => {
  beforeAll(async () => {
    await db.clearItemsTable()
    await db.clearActlsTable()
    await db.clearTodosTable()
  })
  
  describe('0: Clear and re-create all Items back to utils.items status', () => {
    for (let i=0;i<utils.todos.length;i++) {
      const tid=i+1
      it(`POST/todos to create Todo_${tid} of ${utils.todos.length}`, async () => {
        const auid=utils.todos[tid-1].uid
        const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
        const status=201
        return request(app)
          .post('/todos')
          .set('Authorization', utils.credentials[auid-1].token)
          .send(expected)
          .expect(status)
          .then(response => {
            expect(response.body)
              .toEqual(expected)
          })
      })
    }
    for (let i=0;i<utils.items.length;i++) {
      const iid=i+1
      it(`POST/items to create Item_${iid} of ${utils.items.length}`, async () => {
        const tid=utils.items[iid-1].tid
        const auid=utils.todos[tid-1].uid
        const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
        const status=201
        return request(app)
          .post('/items')
          .set('Authorization', utils.credentials[auid-1].token)
          .send(expected)
          .expect(status)
          .then(response => {
            expect(response.body)
              .toEqual(expected)
          })
      })
    }
    for (let i=0;i<utils.actls.length;i++) {
      const id=i+1
      it(`POST/actls to create Actl_${id} of ${utils.actls.length}`, async () => {
        const tid=utils.actls[id-1].tid
        const auid=utils.todos[tid-1].uid
        const expected=JSON.parse(JSON.stringify(utils.actls[id-1]))
        const status=201
        return request(app)
          .post(`/actls/${tid}`)
          .set('Authorization', utils.credentials[auid-1].token)
          .send(expected)
          .expect(status)
          .then(response => {
            expect(response.body)
              .toEqual(expected)
          })
      })
    }
  })
  describe('1: DELETE/items', () => {
    it('DELETE/items/10 success by owner', async () => {
      const iid=10
      const tid=utils.items[iid-1].tid
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/items/2 success by user with write access', async () => {
      const iid=2
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.items[iid-1]))
      return await request(app)
        .delete(`/items/${iid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('2: GET/todos/0 to verify deletion has been successful', () => {
    const auid=3
    it(`GET/todos/0 returns remaining Items of Todos accessible to user ${auid}`, async () => {
      const expected=JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid||todo.id===5)))
      const status=200
      for (let j=0;j<expected.length;j++) {
        expected[j].items=utils.items.filter((item) => item.tid===expected[j].id&&item.id!==2&&item.id!==10)
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
  })
  describe('3: DELETE/todos', () => {
    it('DELETE/todo/9 success by owner', async () => {
      const tid=9
      const auid=utils.todos[tid-1].uid
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
    it('DELETE/todo/5 success by user with write access', async () => {
      const tid=5
      const auid=3
      const expected=JSON.parse(JSON.stringify(utils.todos[tid-1]))
      return await request(app)
        .delete(`/todos/${tid}`)
        .set('Authorization', utils.credentials[auid-1].token)
        .expect(200)
        .then(response => {
          expect(response.body)
            .toEqual(expected)
        })
    })
  })
  describe('4: GET/todos/0 to verify deletion has been successful', () => {
    const auid=3
    it(`GET/todos/0 returns remaining todos and items accessible to user ${auid}`, async () => {
      const expected=JSON.parse(JSON.stringify(utils.todos.filter((todo) => todo.uid===auid&&todo.id!==5&&todo.id!==9)))
      const status=200
      for (let j=0;j<expected.length;j++) {
        expected[j].items=utils.items.filter((item) => item.tid===expected[j].id&&item.id!==2&&item.id!==10)
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
  })

})

