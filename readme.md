#Simple chat application

Built on socket.io, Node.js and Angular 6.

#Running in Docker

To run it in Docker container, please issue

`docker-compose up`

and open `localhost:4200`.

# Running Server and Client locally
## Prerequisites

First, ensure you have the following installed:

1. NodeJS - Download and Install latest version of Node: [NodeJS](https://nodejs.org)
2. Git - Download and Install [Git](https://git-scm.com)
3. Angular CLI - Install Command Line Interface for Angular [https://cli.angular.io/](https://cli.angular.io/)

After that, use `Git bash` to run all commands if you are on Windows platform.

## Clone repository

In order to start the project use:

```bash
$ git clone https://github.com/push1st1k/node-socket-chat.git
$ cd node-socket-chat
```

## Run Server

To run server locally, just install dependencies and run `npm`:

```bash
$ cd server
$ npm install
$ npm start
```

The `socket.io` server will be running on port `3000`

## Run Angular Client

Open other command line window and run following commands:

```bash
$ cd client
$ npm install
$ ng serve
```

Now open your browser in following URL: [http://localhost:4200](http://localhost:4200/)