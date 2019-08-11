#!/usr/bin/env node

const server = require('../lib/server');

const test = async () => {
    let id = await server.save({name: 'Jack', email: 'jack@gmail.com'});
    console.log(id);
};

test();
