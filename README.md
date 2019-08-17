# json-socket-server
Standalone __Websocket Server__ for json-file based data storage.  
Use for fake api, testing and mocking applications.

## Table of contents
- [Install and run](#install-and-run)
- [Connect with Websocket](#connect-with-websocket)

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
__The full native .js example is in the examples folder.__







