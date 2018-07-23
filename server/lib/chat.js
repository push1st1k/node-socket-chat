const db = require('./db');

const activeUsers = new Set();
const LOGO = [['lego', 9], ['men', 40], ['women', 30]];

const _getLogo = () => {
    const info = LOGO[Date.now() % LOGO.length];
    const idx = Date.now() % info[1];
    return `https://randomuser.me/api/portraits/thumb/${info[0]}/${idx}.jpg`;
};

const _init = (io) => {
    io.on('connection', (socket) => {
        let addedUser = false;

        // when the client emits 'message', this listens and executes
        socket.on('message', (data) => {
            // we tell the client to execute 'message'
            const msg = {
                owner: socket.user.name,
                value: data.value,
                room: data.room,
                ts: new Date()
            };
            socket.broadcast.emit('message', msg);
            db.Message.insert(msg);
        });

        // when the client emits 'user add', this listens and executes
        socket.on('user add', async (username) => {
            if (addedUser) return;

            socket.user = {name: username, logo: _getLogo()};
            addedUser = true;
            activeUsers.add(socket.user);

            const messages = await db.Message.getAll();

            socket.emit('login', {
                user: socket.user,
                activeUsers: Array.from(activeUsers),
                messages: messages
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', socket.user);
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('start typing', () => {
            socket.broadcast.emit('start typing', socket.user);
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', () => {
            socket.broadcast.emit('stop typing', socket.user);
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            if (addedUser) {
                activeUsers.delete(socket.user);

                // echo globally that this client has left
                socket.broadcast.emit('user left', socket.user);
            }
        });
    });
};

module.exports = _init;