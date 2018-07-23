const mongoose = require('mongoose');

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

        this.Message = mongoose.model('Message', { owner: String, value: String, ts: Date, room: String });
    }

    async insert(obj) {
        const msg = new this.Message(obj);
        return await msg.save();
    }

    async getAll() {
        return await this.Message.find();
    }
}
module.exports = new Db();