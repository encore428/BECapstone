**Capstone Project**
(issued in an email from qinjiang03@gmail.com dated Aug 24, 2021 as attachment [Capstone Project.pdf](./Capstone Project.pdf))

<ul>
<li>Project Consultation: Tue, 28 Sep, 0900 - 1300 hr</li>
<li>Project Presentation: Tue, 19 Oct, 0900 - 1300 hr</li>
<li>See details [here](https://docs.google.com/document/d/1HxLjVltFH4Imq2mjJn6eIwhB3158NwAo/edit)</li>
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

**Project Objective(s)**
Create a TODO-list CRUD API with these below endpoints:
<ul>
<li>[Public] A registration endpoint that would accept an email and password, and rejects any emails that have been registered before</li>
<li>[Public] A login endpoint that would return a JSON Web token that could be used on authenticated endpoint</li>
<li>[Auth-ed] CRUD endpoints for TODO lists:</li>
    <ul>
	<li>A Create endpoint with the list being created belongs to and can only be accessed by the creator or anyone added to access the list</li>
	<li>A GET all TODO-list endpoint that would return an array of TODO-lists with their titles based on who the currently authenticated user is</li>
	<li>A GET a single TODO-list by its ID endpoint that would return the corresponding TODO-list together with all of the items in the list based on who the current authenticated user is. Returns 403 forbidden with a proper error JSON object if the user cannot access the list</li>
	<li>A PUT/PATCH endpoint to update a TODO-list’s title by its ID based on who the current authenticated user is. Returns 403 forbidden with a proper error JSON object if the user cannot access the list</li>
	<li>A DELETE endpoint to remove a TODO-list. Soft-delete should be used</li>
	</ul>
<li>\[Auth-ed] An endpoint to add someone by email to be able to access a TODO list:</li>
    <ul>
	<li>This operation should be processed in an event-driven manner: The endpoint would immediate respond with an appropriate 200 JSON response after putting an event into a message broker (recommended rabbitmq as there’s a free plan)</li>
	<li>There will be a separate worker process that would consume the message and:</li>
        <ul>
	    <li>Do nothing if there’s no existing user with such email</li>
	    <li>Give the corresponding user with such email access to the list</li>
	    <li>Requeue the message if there are errors during processing</li>
	    </ul>
	</ul>
<li>\[Auth-ed] CUD endpoints for items in a TODO list, only for those with access to the specific list:</li>
    <ul>
	<li>Create an item in the list</li>
	<li>Update an item in the list</li>
	<li>Delete an item from the list. Soft delete should be used</li>
	<li>**Note**: There’s no R endpoint as that’s been covered in the TODO-list CRUD endpoint</li>
	</ul>
</ul>

The app should be deployed to heroku. For the database, you can use the heroku postgres plugin free tier. For the message broker, you can use the free tier from rabbitmq.
The code should be covered with unit test for at least 50%

Bonus:
<ul>
<li>Write integration tests with supertest(https://www.npmjs.com/package/supertest) for all endpoints</li>
<li>Produce an OpenAPI(https://swagger.io/specification/) yaml specs, and use it for request and response validation with express-openapi-validator(https://github.com/cdimascio/express-openapi-validator#readme)</li>
<li>Have a cronjob that update a global counter in the application on how many tasks have been completed for the entire user base every 5 minutes</li>
<li>Have a public socket endpoint that would push updates on the above-mentioned counter whenever it’s updated</li>
</ul>







Create a TODO-list CRUD API with these below endpoints:
<ul>
<li>\[Public]\[POST]register: A registration endpoint that would accept an email and password, and rejects any emails 
    that have been registered before.</li>
<li>\[Public]\[POST]login: A login endpoint that would return a JSON Web token that could be used on authenticated endpoint.</li>
<li>\[Auth-ed] CRUD endpoints for Todo-lists:
    <ul>
	<li>\[POST]\\todo\\create: Create a todo-list header.  The header created belongs to the currently authenticated user.</li>
	<li>\[GET]\\todo\\{0}: Return an array of todo-lists with their titles. For each todo-list, have an arry of all of the 
        todo-items in the list.  Only todo-lists that the currently authenticated user **has access to** are listed.</li>
	<li>\[GET]\\todo\\{tid}: Return an array of one todo-lists identified by {tid} with with all of the todo-items in the list.</li>
    <li>\[PUT]\\todo\\{tid}: Update a todo-list’s title by its ID.</li>
    <li>\[DELETE]\\todo\\{tid}: Remove a TODO-list. Soft-delete should be used.
	</ul>
	Return 404 if a specified item does not exist.  While handling these requests, take note to observe **access control**, 
    and return 403 forbidden with proper error JSON object if the current authenticated user has no necessary access to the 
    objects requested.
</li>
<li>\[Auth-ed] Access control endpoints to maintain access control for todo list.
    <ul>
	<li>\[GET]\\acl\\{tid}: A GET-one endpoint that would return an array of one todo-list with the titles, 
	    and all the users and respective read/write access granted to it.
        <ul>
        <li>Return 404 and an empty array if tid does not exist.</li>
        <li>Returns 403 forbidden in JSON object if current authenticated user is not the owner of todo-list tid.</li>
        <li>Return an array of one item of {tid, title, {email, uid, access} }, with all the access granted
            as sub-array.</li>
        <li>Return an array of one item of \[tid, title ] if todo-list exists but no user have been granted access.</li>
        </ul>
    </li>
	<li>\[GET]\\acl\\{0}: Similar to the GET-one endpoint above, except instead of returning an array of one,
        if returns an array of all todo-lists owned by the current authenticated user.  Return an empty array
        if the current authenticated user does not own any todo-list.</li>
	<li>\[POST]\\acl\\{tid}: A Create endpoint to add access control of the todo-list identified by the specified tid.
        Request body will have an email address, and a read/write indicator.
        <ul>
        <li>Return an empty array if tid does not exist.</li>
        <li>Return an empty array if user by the email address does not exist.</li>
        <li>Returns 403 forbidden in JSON object if current authenticated user is not the owner of todo-list tid.</li>
        <li>Return an array of one item of {tid, title, email, uid, access } for the access created.  If access
            already exists before the request (regardless of whether read or write), return empty array.</li>
        </ul>
    </li>
	<li>\[POST]\\acl\\{0}: Same as above, but the change applies to all todo-list owned by the current authenticated user.
        <ul>
        <li>Return an empty array if current authenticated user does not own any todo-list.</li>
        <li>Return an empty array if user by the email address does not exist.</li>
        <li>Return an array of {tid, title, email, uid, access } for the access created.  If an access already exists,
            before the request (regardless of whether read or write), it does not appear in the returned array.</li>
        </ul>
    </li>
	<li>\[DELETE]\\acl\\{tid}: A Delete endpoint to remove access control of the todo-list identified by the specified tid.
        Request body will have an email address.
        <ul>
        <li>Return an empty array if tid does not exist.</li>
        <li>Return an empty array if user by the email address does not exist.</li>
        <li>Return an empty array if tid/user combination does not exist.</li>
        <li>Returns 403 forbidden in JSON object if current authenticated user is not the owner of todo-list tid.</li>
        <li>Return an array of one item of {tid, title, uid, email, access } for the access deleted.</li>
        </ul>
    </li>
	<li>\[DELETE]\\acl\\{0}: Same as above, but to remove access control of all todo-list owned by the currently 
        authenticated user.
        <ul>
        <li>Return an empty array if currently authenticated user tid does not own any todo-list.</li>
        <li>Return an empty array if user by the email address does not exist.</li>
        <li>Return an array of zero to many items of {tid, title, uid, email, access } for all the access deleted.</li>
        </ul>
    </li>
	<li>These operation should be processed in an event-driven manner: The endpoint would immediate respond with an 
        appropriate 200 JSON response after putting an event into a message broker (recommended rabbitmq as there’s 
        a free plan).  There will be a separate worker process to consume the message and perform the update.  The 
        worker Requeues the message if there are errors during processing</li>
<li>\[Auth-ed] CUD endpoints for items in a TODO list.  For POST/PUT/DELETE requests, Returns 403 forbidden 
        in JSON object if current authenticated user is not the owner of subject todo-list, nor have write access to 
        the todo-list.
    <ul>
	<li>\[POST]\\item\\{tid} to create an item in the todo-list identified by tid.</li>
    <li>\[GET]\\item\\{iid} to get an item identified by iid.  Returns 403 forbidden in JSON object if current authenticated 
        user is not the owner of, nor have read/write access to, the todo-list that the item belongs to.</li>
    <li>\[GET]\\item\\{0} to get an array of items of todo-lists that currently authenticated user owns, or has been
        granted read or write access to.</li>
    <li>\[PUT]\\item\\{iid} to Update an item identified by iid.</li>
	<li>\[DELETE]\\item\\{iid} to Delete an item from the list. Soft delete should be used</li>
    <li>Note: There’s no R endpoint as that’s been covered in the TODO-list CRUD endpoint</li>
 	</ul>
</li>
</ul>
	
The app should be deployed to heroku. For the database, you can use the heroku postgres plugin free tier. For the message broker, you can use the free tier from rabbitmq.
The code should be covered with unit test for at least 50%



