# json-socket-server
Standalone __Websocket Server__ for json-file based data storage.  
Use for fake api, testing and mocking applications.

## Table of contents
- [Install and run](#install-and-run)
- [Connect with Websocket](#connect-with-websocket)
- [Connect and Read data from a collection](#connect-and-read-data-from-a-collection)
- [Create a new document](#create-a-new-document)
- [Update a document](#update-a-document)
- [Delete a document](#delete-a-document)

## Install and run
Install JSON Server

```
npm install -g json-socket-server
```

Create a `db.json` file with some data

```json
{
  "users": [
    { "id": 1, "name": "Joel", "age": 23 }
  ]
}
```

Start JSON Server

```bash
json-socket-server db.json
```

Now the server is running on [ws://localhost:8080](ws://localhost:8080)

## Connect with Websocket
__This server only handles the Websocket connections!__  

Client side: 
```javascript
// Connect to the server.
const socketUrl = "ws://localhost:8080";
let exampleSocket = new WebSocket(socketUrl);

// Listen connection events.
exampleSocket.onopen = (ev) => {
    console.log('Socket opened: ', ev);
};
exampleSocket.onmessage = (m) => {
    let message = JSON.parse(m.data);
    console.log('Message: ', message);
};
exampleSocket.onclose = (ev) => {
    console.log('Socket closed: ', ev);
};
```
__The full native .js example is in the examples/vanilla-js.html file.__

## Connect and Read data from a collection
If you connect to a collection, the server will notify you when it is changed.  
_Client side JAVASCRIPT code:_  
```javascript
exampleSocket.send(JSON.stringify({type: 'read', path: 'users'}));
```
When collection data will changes on the server, you will get a message from it  
in the `onopen` event.  
  
### Get one document by id
```javascript
exampleSocket.send(JSON.stringify({type: 'read', path: 'users', id: 1}));
```
You will get a message with the selected document.

## Create a new document
The code below will create a new user on the server,  
then the server will save it into the .json file.  
```javascript
exampleSocket.send(
    JSON.stringify(
        {
            type: 'create', 
            path: 'users', 
            data: {
                name: 'Paco Rabanne',
                email: 'paco@example.com'
            }
        }
    )
);
```
If you are connected with the specified path,  
the server will notify you from updates.

## Update a document
The code below will update an existing document by id.  
```javascript
exampleSocket.send(
    JSON.stringify(
        {
            type: 'update', 
            path: 'users', 
            id: 5, 
            data: {
                id: 5, 
                name: 'Josh', 
                age: 20
            } 
        }
    )
);
```
If you are connected with the specified path,  
the server will notify you from updates.

## Delete a document
The code below will delete a document by id.  
```javascript
exampleSocket.send(JSON.stringify({type: 'delete', path: 'users', id: 9}));
```
If you are connected with the specified path,  
the server will notify you from updates.









