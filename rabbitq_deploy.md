**Event-driven access control update on RabbitMQ**

**Changes explained**

- To `package.json`, add `"amqplib": "^0.8.0",",` to depedencies so as the add MQ functionality to the application:
```
  "dependencies": {
    "amqplib": "^0.8.0",
	...
  },
```

- Add new program `src/services/amqp.js` to implement method `service.publishActlq(actl, auid, email, reqType)`.  This is 
  one of two places where `amqplib` is used:
```js
const amqplib = require('amqplib')
```  
  It exposes it's `service.publishActlq` method.  This method is called by `src/routes/actlq.js` to enqueue an access control 
  update request.
```js
module.exports = () => {
...
  service.publishActlq = async (actl, auid, email, reqType) => {
  }

  return service
}
```  

- Add new program `src/worker.js` to implement a worker process to consume messages from the queue.  This is the other place 
  where `ampqlib` is used:
```js
const amqplib = require('amqplib')
```  
  Each message is a request to perform update to access control.  This program invokles `db.updateActl` (the same method used 
  by `src/routes/actls.js` endpoint to perform instant update) to perform the update, and console.log the result.  It therefore
  is necessary that the program also requires `('/db')`.
```js
...
const db = require('./db')
...
async function main () {
...
  channel.consume(QUEUE, async (msg) => {
    const data = JSON.parse(msg.content)
    const actl = await db.updateActl(data.actl, data.auid, data.email, data.reqType)
...
  })
}
```
  
- To `src/server.js` and `tests/utils.js`, add these lines to bring in the services rendered by `src/services/amqp.js`:
```
const AmqpService = require('./services/amqp')  // for utils.js, it is ('../src/services/amqp')
const amqpService = AmqpService()
```
  and to include `amqpService` in `router`, so as to make it's services available to endpoints that need them.
```
const router = Router(authMiddleware, authService, amqpService, db)
```

- To `src/routes/index.js`, accept amqpService by adding it to the argument list:
```js
module.exports = (authMiddleware, authService, amqpService, db) => {

```
  add to provide it to a new endpoint `/actlq` by adding this line: 
```js
  router.use('/actlq', require('./actlq')(amqpService))
```

- For this new endpoint `/actlq`, add new program `src/routes/actlq.js`.  This program is almost identical to `src/routes/actls.js`. 
  The difference being that `/actlq` instead of `/actls` is used in the url, and that `src/routes/actlq.js` 
  invokes `service.publishActlq(actl, auid, email, reqType)` to enqueue the request instead of `src/routes/actls.js`'s 
  invoking `db.updateActl` to perform the update inline.
```js
const express = require('express')
...
module.exports = (amqpService) => {
...
  router.post('/:id', async (req, res, next) => {
...
  }
  router.put('/:id', async (req, res, next) => {
...
  }
  router.delete('/:id', async (req, res, next) => {
...
  }
  return router
}
```
  Note that unlike other endpoints with `db` in `module.exports = (db) => {`, this endpoint uses `amqpService` because it does
  not access the database service to perform table updates, but access the message queue to enqueue requests.

- to `.env` and `env.test`, add an entry for the name of the message queue for access control requests.  This queue name is used by 
  `src/services/amqp.js` to enqueue requests, and `src/worker.js` to consume.
```js
ACTL_QUEUE=actlq
```

- To `package.json`, add `"worker": "node src/worker.js",` to scripts, so that the worker process can be started with the 
  command `npm run worker`:
```
  "scripts": {
    ...
    "worker": "node src/worker.js",
    ...
  },
```

- To `Procfile`, add the following so heroku will start the worker process:
```
worker: npm run worker
```  

- Added new program `src/routes/actlq.test.js`.  This program is almost identical to `src/routes/actls.test.js`.  The difference 
  being that since the update is delayed, 1) all none-database updating requests are replicated, and 2) only a subset of test 
  cases that requires database update are included, but the result after database update has to be verified manaully, and 3) for
  the remaining test cases, they have to be conducted manually using postman.

**Local Deployment**
- Start a docker container to deploy rabbit mq with:
```bash
docker run -it -d --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
- manage RabbitMQ at http://localhost:15672/

- Start the worker process:
```bash
npm run worker
```

- Start the app:
```bash
npm start
```

**Heroku Deployment**

