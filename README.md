# Capstone Project

In an email from qinjiang03@gmail.com dated Aug 24, 2021, the attachment <a href="./Capstone Project.pdf">Capstone Project.pdf</a> 
sets out the framework for the Homework and Project as below:

<ul>
<li>Project Consultation: Tue, 28 Sep, 0900 - 1300 hr</li>
<li>Project Presentation: Tue, 19 Oct, 0900 - 1300 hr</li>
<li>See details <a href="https://docs.google.com/document/d/1HxLjVltFH4Imq2mjJn6eIwhB3158NwAo/edit">here</a></li>
<li>Deadline for homework & project submission: Mon, 18 Oct, 1200 hr</li>
<li>Submission (email to qinjiang03@gmail.com):</li>
    <ul><li>Homework:</li>
        <ul><li>Code or repo link</li></ul>
		<li>Project:</li>
        <ul><li>Source code zipped (exclude node_modules)</li>
		    <li>Link to GitHub repo (either public or grant access)</li>
		    <li>Link to Heroku app</li>
		</ul>
	</ul>
</ul>



**Project Title / Description**: Implement a collaborative TODO-list application

<table>
<tr><th>Project requirements</th><th>References</th><th>status</th>
</tr>
<tr>
<tr><td>Source code zipped (exclude node_modules)</td>
    <td>Please refer to the repository.</td>
	<td>To be prepared only at final rollout.</td>
</tr>
<tr><td>Link to GitHub repo (either public or grant access)</td>
    <td>https://github.com/encore428/BECapstone</td>
	<td>Completed</td>
</tr>
<tr><td>Link to Heroku app</td>
    <td>https://todoitem.herokuapp.com/</td>
	<td>Completed</td>
</tr>
<tr><td>Create a Todo list CRUD API</td>
    <td><a href="./API_funcspec.md">Detailed specifications.</a></td>
	<td>Completed with extra features.  Refer to the specifications.</a></td>
</tr>
<tr><td>The app should be deployed to heroku.</td>
    <td>Deployed to https://todoitem.herokuapp.com/.  See <a href="./heroku_deploy.md">deployment notes</a>.</td>
	<td>Completed.</td>
</tr>
<tr><td>For the database, you can use the heroku postgres plugin free tier.</td>
    <td>heroku postgres plugin used.  See <a href="./heroku_deploy.md">deployment notes</a>.</td>
	<td>Completed.</td>
</tr>
<tr><td>For the message broker, you can use the free tier from rabbitmq.</td>
    <td><a href="./rabbitq_deploy.md">Implementation details.</a></td>
	<td>Completed.</td>
</tr>
<tr><td>The code is required to be covered with unit test for at least 50%.</td>
    <td>Read <a href="./full_testing.md">more</a>.</td>
	<td>Completed to 100%.</td>
</tr>
<tr><td colspan="3">Bonus</td>
</tr>
<tr><td>Write integration tests with <a href="https://www.npmjs.com/package/supertest">supertest</a> for all endpoints.</td>
    <td>Read <a href="./full_testing.md">more</a>.</td>
	<td>Completed.</td>
</tr>
</table>

<table>
<tr><th>Other project requirements</th><th>References</th><th>status</th>
</tr>
<tr><td colspan="3">Bonus</td>
</tr>
<tr><td>Produce an OpenAPI(https://swagger.io/specification/) yaml specs, and use it for request and response validation with 
    express-openapi-validator(https://github.com/cdimascio/express-openapi-validator#readme).</td>
    <td></td>
	<td>Not started</td>
</tr>
<tr><td>Have a cronjob that update a global counter in the application on how many tasks have been completed for the entire user 
    base every 5 minutes.</td>
    <td></td>
	<td>Not started</td>
</tr>
<tr><td>Have a public socket endpoint that would push updates on the above-mentioned counter whenever it's updated.</td>
    <td></td>
	<td>Not started</td>
</tr>
</table>

  
