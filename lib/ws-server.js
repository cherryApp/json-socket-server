const WebSocket = require('ws');
const DB = require('./database');

module.exports = class WsServer {
    constructor(filePath, port, watching) {
        this.filePath = filePath || 'db.json';
        this.db = new DB(this.filePath, watching);
        this.wss = new WebSocket.Server({ port: port });
        const endPoints = {};

        this.db.read('posts').then(
            res => console.log(res),
            err => console.error(err)
        );
        /* this.db.create('posts', {name: 'Jack'}).then(
            res => console.log(res),
            err => console.error(err)
        ) */

    }
}
