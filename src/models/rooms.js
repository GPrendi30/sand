const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Chat } = require('./chats');

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
    chats: Chat.schema
}, { timestamps: true });

module.exports = mongoose.model('Room', room);
