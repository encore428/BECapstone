# Use of Postgres Database

**ER Diagram**
The following is the ER diagram of the tables used in the application:
![ER diagram](./ER.png)
`Users` must be created first.

`Users` can create `Todos`.  `Todos.uid` denotes the `Users` who created that `Todos` and is called the owner.  An owner has full
access to update and delete the `Todos` as well as all `Items` that belong to that `Todos`.

`Actls` links a `Users` and a `Todos` and give that relation a read or write access.  It is the exclusive privilalge of the
`Todos` owner to grant and revoke such access through the creation, update, and deletion of `Actls`.  A `Todos` owner has
full access to the `Todos` and therefore do not require the maintenance of `Actls` to grant or restrict his own access.

`Items` are created as children of `Todos`.  It has an attribute of `completed` to track the completion of a task.
It has the attribute `tid` to relate it to a `Todos`.  This `tid` can be changed so the `Items` is transferred to become the 
child of another `Todos`.  The `Users` who created the `Items` will have the `id` recorded in `Items.uid`.  That uid is for 
recording purpose and plays no role in access control nor ownership.

Both `Todos` and `Items` practice soft deletion.  That means records are not physically deleted, but are denoted with the
attribute `deleted`.  To the application, records with `deleted` set to true are ignored.  When a `Todos` is 
soft-deleted, all the `Items` that belong to that `Todos` are also considered deleted and no longer accessible to the
application.

# Local deployment

**Postgres**

In this project, a local copy of Postgres is used.

Using the administrator, a user by the name `todo` and password `todo` was created, and a database by the name `todo`
was created to be owned by the user.
```sql
CREATE ROLE todo WITH LOGIN PASSWORD 'todo';
CREATE DATABASE todo OWNER=todo;
```

**Config Var .env**

The database, the user and password, are declared in `.evv` and `.env.test` as below.
```
# Format: postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>
DATABASE_URL=postgresql://todo:todo@localhost:5432/todo
```

**Database pool**
For the application to connect to the database, `src/db/index.js` has the following code, to cater to both heroku and localdeployment.
```js
const { Pool } = require('pg')
const fs = require('fs')

let pool
if (process.env.MYHEROKU === 'true'){
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync(`${__dirname}/global-bundle.pem`)
    }
  })
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
}
```
**package.json**

Add the following lines to `package.json` to point two two database setup and reset scripts.
```
 "scripts": {
    ...
    "db:dbsetup": "node scripts/dbsetup.js",
    "db:dbreset": "node scripts/dbreset.js",
    ...
```

**db scripts**

Add database scripts `scripts/dbsetup.js`.  This script invoke `db.fullReset()` in `src/db/index/js` to delete and recreate
all four tables.  No backup is performed and all data is lost in the process.
```js
require('dotenv').config()
const db = require('../src/db')

db.fullReset().then(() => {
  console.log('Database table drop and recreate completed')
  process.exit()
}).catch((err) => {
  console.log(err)
  console.log('Database drop and recreate failed')
  process.exit(1)
})
```

Add database scripts `scripts/dbreset.js`.  This script invoke `db.clearAllTables()` in `src/db/index/js` to delete all records
in all tables, and reset the record is sequecne to 1.  This is used mainly use the automated testing of the applicaiton.
```js
require('dotenv').config()
const db = require('../src/db')

db.clearAllTables().then(() => {
  console.log('Database all tables cleared')
}).catch((err) => {
  console.log(err)
  console.log('Database all tables clearing failed')
  process.exit(1)
})
```

# Heroku deployment

**Heroku Postgres Add-on**

Add `Heroku Postgres` picking the `Hobby Dev` plan.
![heroku postgres add-on](./heroku_db.png)

**global-bundle.pem**

Add `src/db/global-bundle.pem` downloaded from https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem.  This
file is necessary to connect to Postgres and is referenced in the modified `src/db/index.js`.

**Config Var**

You will notice that heroku has already added `DATABASE_URL`.  You will need to add `MYHEROKU` and set it to `true`
so that `src/db/index.js` picks it up and execute the connection logic for Postgres on heroku.
![heroku postgres Config Var](./heroku_db_configvar.png)

**Procfile** 

Add the following line to `Procfile` so heroku knows how to set-up the database on each release.
```
release: npm run db:dbsetup
``` 

**Reset database**
- From https://dashboard.heroku.com/apps/todoitem
- Top right: [More] / [Run console]
- Run this command: `npm run db:dbreset` to truncate all tables and reset sequence number to 1.
