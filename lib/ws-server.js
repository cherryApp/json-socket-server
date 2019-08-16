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
            case 'get': this.handleGet(client, message);
            break;
            case 'post': this.handlePost(client, message);
            break;
            default: 
                client.send(
                    this.transform({type: 'error', data: 'Invalid type!'})
                );                
        }
    }

    handleGet(client, message) {
        this.addListener(message.path, client.connId);
        this.db.read('posts').then(
            res => this.broadcast(message.path, res),
            err => this.sendError(client, err)
        );
    }
    
    handlePost(client, message) {
        console.log('Handle post: ', client.connId, message);
        this.db.create(message.path, message.data).then(
            res => {
                console.log('Handle post 2: ', client.connId, res);
                // TODO: broadcast changes.
                this.oneToOne(client, {type: 'post', data: res});
                // this.broadcast(message.path, {type: 'get', list});
            }, 
            err => this.sendError(client, err)
        );
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

    addListener(path, connId) {
        if (!this.listeners[path]) {
            this.listeners[path] = [];
        }

        if (!this.listeners[path].includes(connId)) {
            this.listeners[path].push(connId);
        }
    }
}
