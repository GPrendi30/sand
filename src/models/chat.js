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
    attachments: [Buffer], // in case of images
    timestamp: {
        type: Date,
        default: () => Date.now()
    }
}, { timestamp: true });


const chatSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    messages: [message]
}, { timestamps: true });

const Message = mongoose.model('Message', message);

chatSchema.methods.sendMessage = function (user, message) {
    const newMessage = new Message({ user: user._id, username: user.username, body: message });
    // if (!this.users.includes(newMessage.user)) return // dont add message if user is not in chat.

    this.messages.push(newMessage);
};

chatSchema.methods.getMessages = function () {
    return this.messages.map(message => { return { _id: undefined, ...message._doc } });
};

chatSchema.methods.addUser = function (user) {
    user.addChat(this);
    this.users.push(user._id);
}

const Chat = mongoose.model('Chat', chatSchema);






module.exports.Chat = Chat
module.exports.Message = Message
