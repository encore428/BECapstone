**Detailed functional specifications of API**

**Functional deviations**

The app as delivered has these deviations;

- The access control is more sophisticated.
- The access control endpoints handles POST, PUT, and DELETE of access controls.
- Read only, or read and write access can be granted by the owner of a Todo for a non-owner users to access the Todo.
- With write access, the guest user can update a Todo, add/update/delete Items belonging to that Todo.
- With read only access, the guest user can update Items of the Todo.
- Transfer of Items from one Todo to another can be accomplished by updating the {tid} of an Item.  This transfer
  is considered deleting an Item from one Todo, and adding an Item to another Todo, and therefore requires
  write access to both Todos to accomplish.
  
- Additional `/todos/0` endpoint.  This endpoint returns an array of Todos that the requester has read access to, and each
  Todo will have its Items returned too.
  
- Access control end-points are implemented with immediate update.  Delayed update via message queue approach is not 
  implemented yet.

**Public Entry Endpoints**
- POST/register: registration endpoint to create new Users.  Reject a request if {email} has been registered before.
- POST/login: login endpoint that returns a JSON Web token that can be used on authenticated endpoints.
- Request body for both entry points have an {email} and a {password}.

**Authenticated Functional Entry Endpoints**
- CRUD endpoints for Todos.
- CUD endpoints to maintain access control for Todos.
- CUD endpoints for Items.

**CRUD endpoints for Todos**
- POST/todos: Create a Todo record.  The record created belongs to the currently authenticated user.
- GET/todos: Return with status code 200 and an array of Todos to which the authenticated user has read access.  
  No children Item is returned.
- GET/todos/{tid}: Return with status code 200 and the Todo identified by {tid}, include all of its children Items.  
- GET/todos/0: Return with status code 200 and an array of Todos to which the authenticated user has read access to. 
  This entry point differs from `GET/todos` in that Items of each Todo are also returned nested.
  If no Todo is found, return with status code 404.
- PUT/todos/{tid}: Update the title of Todo{tid}.
- DELETE/todos/{tid}: Delete Todo{tid}. Soft-delete should be practiced.

**Access Control in CRUD/Todos**
- If a non-zero {tid} is provided in the endpoint, and no Todo record exists with that {tid}, return with status code 404.
- Soft-deleted records are considered non-existent.
- If a non-zero {tid} is provided in the endpoint, and a Todo record is found, yet the current authenticated user has no 
  necessary access to the Todo, do not perform any processing, but return with status code 403 with an error message.
- *Necessary access* means: Owner as well as users given write access to the Todo can GET/PUT/DELETE the Todo.  Users given
  read access to the Todo can only GET the Todo.
- If a non-zero {tid} is provided in the endpoint, and a Todo record is found, and the current authenticated user has the 
  *necessary access* to the Todo, perform the required processing, and return with status code 200 with the Todo record.
- In the case of create, return the created Todo record.  In the case of Update, return the updated todo record.  In the
  case of Delete, return the Todo record before deletion.
- In a GET endpoint without {tid}, only Todo records to which the current authenticated user has read access to will be 
  retrieved.  Even if none is found, return code should be 200.

**CUD endpoints to maintain access control for Todos**
- POST/actls/{tid}: A Create endpoint to add access control of the Todo identified by {tid}.
- PUT/actls/{tid}: A Update endpoint to update access control of the Todo identified by {tid}.
- DELETE/actls/{tid}: A Delete endpoint to remove access control of the Todo identified by {tid}.
- Request body will identify the user by either a numeric {uid} or an {email} address.
- Except for DELETE, request body must provide an access indicator {rmlw}, 1 for read, and 3 for write.
- Return 404 if Todo{tid} does not exist.
- Return 404 if User{email/uid} does not exist.
- Return 403 forbidden if current authenticated user is not the owner of Todo{tid}.
- Except for POST, return 404 if Access control record for User{email/uid} to Todo{tid} does not exist.
- For POST request: If there is no existing access, create the access according to the request;  If the targetted access control 
  record already exists, upgraded to write access if the POST is to create a write, otherwise, the access control is not changed.
- For PUT request, the targetted access control record will be updated to read or write as per the PUT request.
- The request when executed successfully, will return with status code 200, and in JSON object format the access control record 
  just created (POST), just updated (PUT), or just before deletion (DELETE).  This is the case even if the POST or PUT request
  does not require any change to the existing access control record.

**CUD endpoints to maintain Items**
- POST/items to create an Item as the child of Todo{tid}.
- PUT/items/{iid} to update Item{iid}.
- DELETE/items/{iid} to delete Item{iid}.
- Request body to provide {tid} and {title} for POST; one or more of these: {title}, {completed}, {new_tid} for PUT.
- Return 404 if Item{iid} does not exist.  When it does exist, obtain {tid} from the retrieved Item record.
- For PUT, if {new_tid} is provided, return 404 if Todo{new_tid} does not exist. 
- For POST and DELETE, the authenticated user must have write access to Todo{tid} that is the parent of the Item{iid}.
- For PUT, the authenticated user must have read or write access to Todo{tid} that is the parent of the Item{iid}. 
  Return 403 if not.
- For PUT, if {new_tid} is provided and it is different from {tid}, the authenticated user must have write access to 
  both Todo{tid} and Todo{new_tid}.  Return 403 if not.
- When a new Item is created by POST request, it is created with completed=false, and uid=current authenticated user.
- Return status code 200 with the Item record created for POST, after update for PUT, and just before deletion for DELETE.


**Pending Task**

Change all the Access control operations to be processed in an event-driven manner: The endpoint would 
immediately respond with an appropriate 200 JSON response after putting an event into a message broker (recommended rabbitmq 
as there’s a free plan).  There will be a separate worker process to consume the message and perform the update.

