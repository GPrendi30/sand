const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const message = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    body: String,
    attachments: [Buffer] // in case of images
}, { timestamp: true });


const chatSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    messages: [message]
}, { timestamps: true });


chatSchema.methods.addMessage = function (message) {
    if (!this.users.includes(message.user)) return // dont add message if user is not in chat.

    this.messages.push(message);
};

chatSchema.methods.getMessages = function () {
    return this.messages.map(message => { return { _id: undefined, ...message._doc } });
};

chatSchema.methods.addUser = function (user) {
    this.users.push(user);
}

const chat = mongoose.model('Chat', chatSchema);
module.exports.Chat = chat
module.exports.Message = mongoose.model('Message', message);
