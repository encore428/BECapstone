# Deployment to heroku

**Application changes**
- `src/db/index.js`, add the following to cater to heroku deployment:
```js
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
- Add `src/db/global-bundle.pem` downloaded from https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem.  This
  file is necessary to connect to postgresql.
  
- Add `Procfile` with the following so heroku knows how to release and start the application:
```
release: npm run db:dbsetup
web: npm run start
```  

**Configuration at the heroku.com**
- Sign in to https://dashboard.heroku.com/apps
- Top right: [New] / [Create new app]
- Assign App name `todoitem`, click [Create  app]
- link to git repository `encore428/BECapstone`
- Under Resources, add `Heroku Postgres` using `Hobby Dev` plan.
- Under Settings, create these Config Vars:

Config Vars  | Value                     | Notes
-------------|---------------------------|---------------------------------------------------------
DATABASE_URL |                           | Auto created by heroku when `Heroku Postgres` was added
MYHEROKU     | true                      | So that the db connects to postgresql at heroku
JWT_EXPIRY   | 900                       |
JWT_SECRET   | prod_secret               | your choice of value
SALT_ROUNDS  | 10                        |

**To set up database**
- From https://dashboard.heroku.com/apps/todoitem
- Top right: [More] / [Run console]
- Run this command: `npm run db:dbsetup`.  This will drop and create all application tables.
- To truncate all tables and reset sequence number to 1, Run this command instead `npm run db:dbreset`.

