**Detailed functional specifications of API*

There are public entry points for user registration and login, and authenticaed functional entry points.

**Public Entry Points**
<ul>
<li>/[POST]register: A registration endpoint to create new Users.
    <ul>
	<li>Request body will have an {email} and a {password}.</li>
	<li>Reject a request if {email} has been registered before.</li>
	</ul>
</li>
<li>/[POST]login: A login endpoint that returns a JSON Web token that could be used on authenticated endpoints.  
    Request body will have an {email} and a {password}.</li>
</ul>

**Authenticaed Functional Entry Points**
<ul>
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
	<li>In all the above endpoints, observe <b>access control</b> as follows:
	    <ul>
		<li>If a non-zero {tid} is provided in the endpoint, and no Todo record exists with that {tid}, return with status code 404.</li>
		<li>Soft-deleted records are considered non-existent.</li>
        <li>If a non-zero {tid} is provided in the endpoint, and a Todo record is found, yet the current authenticated user has no 
		    necessary access to the Todo, do not perform any processing, but return with status code 403 with an error message.</li>
        <li><b>Necessary access</b> means: Owner as well as users given write access to the Todo can GET/PUT/DELETE the Todo.  Users given
            read access to the Todo can GET the Todo.</li>
        <li>If a non-zero {tid} is provided in the endpoint, and a Todo record is found, and the current authenticated user has the 
		    necessary access to the Todo, perform the required processing, and return with status code 200 with the Todo record.
			In the case of create, return the created Todo record.  In the case of Update, return the updated todo record.  In the
			case of Delete, return the Todo record before deletion.</li>
		<li>In a GET endpoint without {tid}, only Todo records to which the current authenticated user has read access to will be 
		    retrieved.  Even if none is found, return code should be 200.</li>
        </ul>
	</li>
	</ul>
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
	</ul>
</li>
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
	</ul>
</li>
</ul>
