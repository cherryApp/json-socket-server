#!/usr/bin/env node

const cli = require('../lib/cli');
const WsServer = require('../lib/ws-server');

// Create socket server.
const wsServer = new WsServer(cli.input[0], cli.flags.port, cli.flags.watch);

/* const test = async () => {
    let id = await server.save({name: 'Jack', email: 'jack@gmail.com'});
    console.log(id);
};

test();
 */