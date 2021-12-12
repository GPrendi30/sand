
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    surname: String,
    assets: [String],
    friendlist: [String],
    friendRequest: [String],
    friendRequestSent: [String],
    ppic: Buffer, // profile picture, TODO change to buffer when uploading a file
    bio: String,
    tracking: [String],
    recentlyViewed: [String],
    preferences: {
        language: String,
        theme: String,
        currency: String
        // add more preferences
    },
    chats: [{
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    }],

    blocked: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true, collection: 'users' });

userSchema.methods.addChat = function (chat) {
    this.chats.push(chat._id);
}

const model = mongoose.model('User', userSchema);

module.exports = model;

