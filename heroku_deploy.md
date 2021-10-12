**Deployment to heroku**

- Sign in to https://dashboard.heroku.com/apps
- Top right: [New] / [Create new app]
- Assign App name "todoitem", click [Create  app]
- link to git repository "encore428/BECapstone"
- Under Resources, add "Heroku Postgres" using "Hobby Dev" plan.
- Under Settings, create these Config Vars:
-- DATABASE_URL: already created by heroku
-- MYHEROKU: true
-- JWT_EXPIRY: 900
-- JWT_SECRET: myjwtsecret123
-- SALT_ROUNDS: 10

**To set up database**
- From https://dashboard.heroku.com/apps/todoitem
- Top right: [More] / [Run console]
- Run this command: "npm run db:migrate".  This will create all the tables if not already exist, truncate all tables.
- To truncate all tables and reset sequence number to 1, Run this command instead "npm run db:clear"

