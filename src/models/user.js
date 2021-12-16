
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
    friendlist: [{
        type: Schema.Types.ObjectId,
        ref: 'User'

    }],
    friendRequest: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequestSent: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
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
    this.chats.push(chat);
}

userSchema.methods.sendFriendRequest = function (friend) {
    if (this.friendRequestSent.includes(friend._id)) return;

    this.friendRequestSent.push(friend._id);
}

userSchema.methods.revokeFriendRequest = function (friend) {
    if (!this.friendRequestSent.includes(friend._id)) return;
    const idx = this.friendRequestSent.indexOf(friend._id);
    this.friendRequest.splice(idx, 1);
}


userSchema.methods.acceptFriendRequest = function (friend) {
    const idx = this.friendRequest.indexOf(friend._id);
    if (idx < 0) return;

    this.friendRequest.splice(idx, 1);
    this.friendlist.push(friend._id);
}

userSchema.methods.declineFriendRequest = function (friend) {
    const idx = this.friendRequest.indexOf(friend._id);

    if (idx < 0) return;

    this.friendRequest.splice(idx, 1);
}



userSchema.methods.blockFriend = function (friend) {
    if (this.blocked.includes(friend._id)) return;

    this.blocked.push(friend._id);
}

userSchema.methods.unblock = function (friend) {
    const idx = this.blocked.indexOf(friend._id);
    if (idx < 0) return;

    this.blocked.splice(idx, 1);
}

const model = mongoose.model('User', userSchema);

module.exports = model;

