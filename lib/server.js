const WebSocket = require('ws');
const database = require('./database');

const wss = new WebSocket.Server({ port: 8080 });
const endPoints = {};

module.exports = {
    greet: () => {
        return `UUID: ${uuidv1()}`;
    },
    save: database.save
}