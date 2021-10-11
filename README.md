**Capstone Project**

In an email from qinjiang03@gmail.com dated Aug 24, 2021, the attachment <a href="./Capstone Project.pdf">[Capstone Project.pdf]</a> 
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

**Project Objective(s)**

Create a Todo list CRUD API with these below endpoints (note, the following has been re-worded to better match the completed app):
<ul>
<li>[Public]/[POST]register: A registration endpoint to create new Users.
    <ul>
	<li>Request body will have an {email} and a {password}.</li>
	<li>Reject a request if {email} has been registered before.</li>
	</ul>
</li>
<li>[Public]/[POST]login: A login endpoint that returns a JSON Web token that could be used on authenticated endpoints.  
    Request body will have an {email} and a {password}.</li>
<li>[Auth-ed] CRUD endpoints for Todos:
    <ul>
	<li>[POST]/todos: Create a Todo record.  The record created belongs to the currently authenticated user.</li>
	<li>[GET]/todos: Return an array of Todos to which the authenticated user has read access.  No children Item
        is returned.  Status code is 200 even if no Todo is returned.</li>
	<li>[GET]/todos/{tid}: Return the Todo identified by {tid}, include all of its children Items with status code 200.
	    <ul>
		<li>If Todo is not found, return with status code 404.</li>
		<li>If Todo is found but the authenticated user does not have read acces to, return status code 403.
		</ul>
	</li>
	<li>[GET]/todos/0: Return an array of Todos to which the authenticated user has read access to with status code 200. 
	    For each Todo in the array, include all of its children Items.  If no Todo is found, return with status code 404.</li>
    <li>[PUT]/todos/{tid}: Update the title of Todo{tid}.</li>
    <li>[DELETE]/todos/{tid}: Delete Todo{tid}. Soft-delete should be practiced.
	<li>In all the above endpoints, observe **access control** as follows:
	    <ul>
		<li>If a non-zero {tid} is provided in the endpoint, and no Todo record exists with that {tid}, return with status code 404.</li>
		<li>Soft-deleted records are considered non-existent.</li>
        <li>If a non-zero {tid} is provided in the endpoint, and a Todo record is found, yet the current authenticated user has no 
		    necessary access to the Todo, do not perform any processing, but return with status code 403 with an error message.</li>
        <li>Necessary access means: Owner as well as users given write access to the Todo can GET/PUT/DELETE the Todo.  Users given
            read access to the Todo can GET the Todo.</li>
        <li>If a non-zero {tid} is provided in the endpoint, and a Todo record is found, and the current authenticated user has the 
		    necessary access to the Todo, perform the required processing, and return with status code 200 with the Todo record.
			In the case of create, return the created Todo record.  In the case of Update, return the updated todo record.  In the
			case of Delete, return the Todo record before deletion.</li>
		<li>In a GET endpoint without {tid}, only Todo records to which the current authenticated user has read access to will be 
		    retrieved.  Even if none is found, return code should be 200.</li>
        </ul>
	</li>
</li>
<li>[Auth-ed] Access control endpoints to maintain access control for Todos.
    <ul>
	<li>[POST]/actls/{tid}: A Create endpoint to add access control of the Todo identified by {tid}.
        Request body will identify the user by either a numeric {uid} or an {email} address, and a {read/write} indicator.
        <ul>
        <li>Return 404 if Todo{tid} does not exist.</li>
        <li>Return 404 if User{email/uid} does not exist.</li>
        <li>Return 403 forbidden if current authenticated user is not the owner of Todo{tid}.</li>
        <li>If there is no existing access, create the access according to the request.  If there is existing read access while 
		    the request is to grant write access, update the access control to write.  If there is existing access while 
			the request is to grant read access, update nothing.  In all cases, return status code 200, with the latest
			Access control record in JSON object.</li>
        </ul>
    </li>
	<li>[PUT]/actls/{tid}: A Update endpoint to update access control of the Todo identified by {tid}.
        Request body will identify the user by either a numeric {uid} or an {email} address, and a {read/write} indicator.
        <ul>
        <li>Return 404 if Todo{tid} does not exist.</li>
        <li>Return 404 if User{email/uid} does not exist.</li>
        <li>Return 404 if Access control record for User{email/uid} to Todo{tid} does not exist.</li>
        <li>Return 403 forbidden in JSON object if current authenticated user is not the owner of Todo{tid}.</li>
        <li>If the existing access is same as requested, update nothing.  If the existing access differs from requested, 
            update the access control to according to the request.  In all cases, return status code 200, with the latest
			Access control record in JSON object.</li>
        </ul>
    </li>
	<li>[DELETE]/actls/{tid}: A Delete endpoint to remove access control of the Todo identified by {tid}.
        Request body will identify the user by either a numeric {uid} or an {email} address.
        <ul>
        <li>Return 404 if Todo{tid} does not exist.</li>
        <li>Return 404 if User{email/uid} does not exist.</li>
        <li>Return 404 if Access control record for User{email/uid} to Todo{tid} does not exist.</li>
        <li>Return 403 forbidden if current authenticated user is not the owner of Todo{tid}.</li>
        <li>Delete the access control, return status code 200, with the Access control record as before deleting in JSON object.</li>
        </ul>
    </li>
	<li>For next enhancement, change all the Access control operations to be processed in an event-driven manner: The endpoint would 
	    immediately respond with an appropriate 200 JSON response after putting an event into a message broker (recommended rabbitmq 
		as there’s a free plan).  There will be a separate worker process to consume the message and perform the update.</li>
<li>[Auth-ed] CUD endpoints for Items.  For POST/PUT/DELETE requests.
    <ul>
	<li>[POST]/items to create an Item as the child of Todo{tid}.
		<ul>
		<li>Request body will provide {tid} and {title} for the item.</li>
		<li>If current authenticated user is not the owner of nor have write access to Todo{tid}, reject the request with status 
		    code 403.</li>
		<li>Otherwise, an Item is created with the {title}, completed=false, and with uid=current authenticated user</li>
		</ul>
	</li>
    <li>[PUT]/items/{iid} to update Item{iid}.
		<ul>
		<li>Request body will provide one or more of these attributes: {title}, {completed}, {new_tid}.</li>
        <li>Return 404 if Item{iid} does not exist.</li>
        <li>Now that Item{iid} exists, obtain {tid} to its parent Todo.</li>
		<li>If {new_tid} is provided and it differs from {tid}, this is a item transfer from Todo{tid} to Todo{new_tid}.  Look for 
		    Todo{new_tid}, and return 404 if Todo{new_tid} is not found.</li>
		<li>If {tid}={new_tid}, then if current authenticated user is not the owner of nor have read access to Todo{tid}, reject 
		    the request with status code 403.</li>
		<li>If {tid} not the same as {new_tid}, check that current authenticated user is the owner of or have write access to both
		    Todo{tid} and Todo{new_tid}, reject the request with status code 403.</li>
		<li>Compare the existing Item with the proposed Item.  If no difference, do nothing, return the Item record as it with 
		    status code 200.  If differences found, update the Item record accordingly, and return the updated Item record with 
			status code 200.</li>
		</ul>
	</li>
</li>
</ul>
	
The app should be deployed to heroku. For the database, you can use the heroku postgres plugin free tier. For the message broker, 
you can use the free tier from rabbitmq.

The code is required to be covered with unit test for at least 50%.  **The code as delivered has been covered with unit test 100%.** 
**The unit test cases are all contained within four test.js under the src/routes folder.**


Bonus:
<ul>
<li>Write integration tests with supertest(https://www.npmjs.com/package/supertest) for all endpoints.  
**This is completed with the file tests/int.test.js.**</li>
<li>Produce an OpenAPI(https://swagger.io/specification/) yaml specs, and use it for request and response validation with 
    express-openapi-validator(https://github.com/cdimascio/express-openapi-validator#readme)</li>
<li>Have a cronjob that update a global counter in the application on how many tasks have been completed for the entire user 
    base every 5 minutes</li>
<li>Have a public socket endpoint that would push updates on the above-mentioned counter whenever it's updated</li>
</ul>
