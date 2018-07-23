const mongoose = require('mongoose');
const Message = require('./Message');

class Db {
    constructor() {
        mongoose.connect(`mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/admin`, {
            useNewUrlParser: true,
            auth: {
                user: process.env.MONGODB_USERNAME,
                password: process.env.MONGODB_PASSWORD
            }
        })
        .then(_ => {
            console.log('connected to MongoDB');
        })
        .catch(e => {
            console.error('cannot connect', e);
        });

        this.Message = new Message(mongoose);
    }
}
module.exports = new Db();