const WebSocket = require('ws');
const database = require('./database');

module.exports = class WsServer {
    constructor(filePath, port, watching) {
        this.wss = new WebSocket.Server({ port: port });
        const endPoints = {};

    }
}
