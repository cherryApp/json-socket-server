const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');
const DB = require('./database');

module.exports = class WsServer {
    constructor(filePath, port, watching) {
        this.filePath = filePath || 'db.json';
        this.db = new DB(this.filePath, watching);
        this.wss = new WebSocket.Server({ port: port });
        this.connections = {};
        this.listeners = {};

        this.setListeners();

        /* this.db.read('posts').then(
            res => console.log(res),
            err => console.error(err)
            ); */
        /* this.db.read('posts', 2).then(
            res => console.log(res),
            err => console.error(err)
        ); */
        /* this.db.create('posts', {name: 'Jack'}).then(
            res => console.log(res),
            err => console.error(err)
        ) */
        /* this.db.update('posts', {id: 2, content: 'New Content'}).then(
            res => console.log(res),
            err => console.error(err)
        ); */
        /* this.db.delete('posts', 6).then(
            res => console.log(res),
            err => console.error(err)
        ); */

    }

    setListeners() {
        this.wss.addListener("connection", (client) => {
            let connId = uuidv1();
            client.connId = connId;
            this.connections[connId] = client;
            console.log("Connected: ", connId);

            client.on("message", rawMessage => {
                this.handleMessages(client, this.transform(rawMessage));
            });
        });
    }

    handleMessages(client, message) {
        if (!message.type || !message.type.toLowerCase) {
            return client.send(
                this.transform({type: 'error', data: 'No message type!'})
            );
        }
        switch(message.type.toLowerCase()) {
            case 'read': this.handleRead(client, message);
            break;
            case 'create': this.handleCreate(client, message);
            break;
            case 'update': this.handleUpdate(client, message);
            break;
            case 'delete': this.handleDelete(client, message);
            break;
            default: 
                client.send(
                    this.transform({type: 'error', data: 'Invalid type!'})
                );                
        }
    }

    // Connect to a path and get document data.
    async handleRead(client, message) {
        try {
            this.checkObjectProp(message, 'path');

            this.addListener(message.path, client.connId);
            let result = await this.db.read(message.path, message.id);
            this.oneToOne( 
                client, 
                {
                    type: message.type,
                    path: message.path,
                    data: result
                }
            );
        } catch (error) {
            console.error(error);
            this.sendError(client, error);
        }
    }
    
    // Create document.
    async handleCreate(client, message) {
        try {
            this.checkObjectProp(message, 'path');
            this.checkObjectProp(message, 'data');

            let newObject = await this.db.create(message.path, message.data);
            this.oneToOne(client, {type: message.type, data: newObject});
            
            let pathDocuments = await this.db.read(message.path);
            console.log(pathDocuments);
            this.broadcast(
                message.path, 
                {
                    type: 'update', 
                    path: message.path, 
                    data: pathDocuments
                }
            );
        } catch (e) {
            this.sendError(client, e)
        }
    }
    
    // Update document.
    async handleUpdate(client, message) {
        try {
            this.checkObjectProp(message, 'path');
            this.checkObjectProp(message, 'id');
            this.checkObjectProp(message, 'data');

            let updatedObject = await this.db.update(
                message.path, 
                message.id, 
                message.data
            );
            this.oneToOne(client, {type: message.type, data: updatedObject});
            
            let pathDocuments = await this.db.read(message.path);
            this.broadcast(
                message.path, 
                {
                    type: 'update', 
                    path: message.path, 
                    data: pathDocuments
                }
            );
        } catch (e) {
            this.sendError(client, e)
        }
    }
    
    // Delete document.
    async handleDelete(client, message) {
        try {
            this.checkObjectProp(message, 'path');
            this.checkObjectProp(message, 'id');

            let response = await this.db.delete(message.path, message.id);
            this.oneToOne(client, {type: message.type, data: response});
            
            let pathDocuments = await this.db.read(message.path);
            this.broadcast(
                message.path, 
                {
                    type: 'update', 
                    path: message.path, 
                    data: pathDocuments
                }
            );
        } catch (e) {
            this.sendError(client, e)
        }
    }

    oneToOne(client, data) {
        client.send(
            this.transform(data)
        );
    }

    broadcast(path, data) {
        for( let connId of this.listeners[path] ) {
            if (this.connections[connId]) {
                this.connections[connId].send(this.transform(data));
            }
        }
    }

    sendError(client, data) {
        client.send(
            this.transform({type: 'error', data: data})
        );
    }

    transform(jsonOrObject) {
        return typeof jsonOrObject === 'string' 
            ? JSON.parse(jsonOrObject) 
            : JSON.stringify(jsonOrObject);
    }

    checkObjectProp(obj, key) {
        if (!obj[key]) {
            throw new Error(`${key} is not specified in update request!`);
        }
    }

    addListener(path, connId) {
        if (!this.listeners[path]) {
            this.listeners[path] = [];
        }

        if (!this.listeners[path].includes(connId)) {
            this.listeners[path].push(connId);
        }
    }
}
