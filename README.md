# json-socket-server
Standalone __Websocket Server__ for json-file based data storage.  
Use for fake api, testing and mocking applications.

## Table of contents
[Getting started](#getting-started)

## Getting started
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

Now the server is running on [http://localhost:8080](http://localhost:8080)




