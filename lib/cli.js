const meow = require('meow');

// Process arguments.
const cli = meow(`
    Usage
      $ json-socket-server <json-file-path>
 
    Options
      --watch, -w (false) Watching file changes.
      --port, -p  (8080) The port of json-socket-server.
 
    Examples
      $ json-socket-server ./json/users.json --watch -p 3210
`, {
    flags: {
        watch: {
            type: 'boolean',
            alias: 'w'
        },
        port: {
            type: 'number',
            alias: 'p',
            default: 8080
        }
    }
});

module.exports = cli;