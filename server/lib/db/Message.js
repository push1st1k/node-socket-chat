module.exports = class Message {
    constructor(mongoose) {
        this.mongoose = mongoose;
        this.model = mongoose.model('Message', { owner: String, value: String, ts: Date, room: String });
    }

    async insert(obj) {
        return await new this.model(obj).save();
    }

    async getAll() {
        return await this.model.find();
    }
}