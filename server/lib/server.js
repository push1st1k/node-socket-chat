const path = require('path');
const http = require('http');

const express = require('express');
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

module.exports = server;