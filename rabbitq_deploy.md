**Event-driven access control update on RabbitMQ**

**Application changes**

- `package.json`, add `"amqplib": "^0.8.0",",` to depedencies:
```
  "dependencies": {
    "amqplib": "^0.8.0",
	...
  },
```

- `package.json`, add `"worker": "node src/worker.js",` to scripts:
```
  "scripts": {
    ...
    "worker": "node src/worker.js",
    ...
  },
```

- `src/server.js` and `tests/utils.js`, add these lines, 
```
const AmqpService = require('./services/amqp')
const amqpService = AmqpService()
```
and include `amqpService` in `router`.
```
const router = Router(authMiddleware, authService, amqpService, db)
```

- `src/routes/index.js` and endpoint for the depayed access control update: 
```
  router.use('/actlq', require('./actlq')(db))
```

- Add new program `src/services/amqp./js` to implement method `service.publishActlq(actl, auid, email, reqType)`.  This 
  method is used to enqueue a request.
  
- Add new program `src\worker.js` to implement the worker process that consumes messages from the queue.  Each message is a request
  to perform update to access control.  Call `db.updateActl` (the same method used by the endpoints to perform instant update) to 
  perform the update, and console.log the result.
  
- Added new program `src/routes/actlq.js`.  This program is almost identical to `src/routes/actls.js`.  The difference being that
  `actlq` instead of `actls` is used in the url, and that `actlq` enqueue the request instead of directly invoking `db.updateActl`
  to perform the update immediately.
  
- Added new program `src/routes/actlq.test.js`.  This program is almost identical to `src/routes/actls.test.js`.  The difference 
  being that since the update is delayed, ...


**Infrastructure**
- Start a docker container to deploy rabbit mq with:
```bash
docker run -it -d --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
- manage RabbitMQ at http://localhost:15672/

- Start the worker process:
```bash
npm run worker
```



**Configuration at the heroku.com**
- Sign in to https://dashboard.heroku.com/apps
- Top right: [New] / [Create new app]
- Assign App name `todoitem`, click [Create  app]
- link to git repository `encore428/BECapstone`
- Under Resources, add `Heroku Postgres` using `Hobby Dev` plan.
- Under Settings, create these Config Vars:

Config Vars  | Value                     | Notes
-------------|---------------------------|------------------------------------------------
DATABASE_URL |                           | Already created by heroku     
MYHEROKU     | true                      | So that the db connects to postgresql at heroku
JWT_EXPIRY   | 900                       |
JWT_SECRET   | myjwtsecret123            | your choice of value
SALT_ROUNDS  | 10                        |

**To set up database**
- From https://dashboard.heroku.com/apps/todoitem
- Top right: [More] / [Run console]
- Run this command: `npm run db:migrate`.  This will create all the tables if not already exist.
- To truncate all tables and reset sequence number to 1, Run this command instead `npm run db:clear`.

