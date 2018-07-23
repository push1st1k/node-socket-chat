const server = require('./lib/server');
const chat = require('./lib/chat');

const io = require('socket.io')(server);

chat(io);


