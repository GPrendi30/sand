const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Chat } = require('./chat');

const room = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    icon: Buffer, // image
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chat: { 
        type: Chat.schema,
        default: () => new Chat()
    }
}, { timestamps: true });

room.methods.addAdmin = function (admin, user) {
    if (!this.admins.includes(user)) {
        this.admins.push(user);
    }
}

module.exports = mongoose.model('Room', room);
