
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
    rooms: [{
        type: Schema.Types.ObjectId,
        ref: 'Room'
    }],
    ppic: Buffer,
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

// update save the request to the friend.
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
userSchema.methods.unFriend = function (friend) {
    const idx = this.friendlist.indexOf(friend._id);
    if (idx < 0) return;
    this.friendlist.splice(idx, 1);
}

userSchema.methods.addRoom = function (room) {
    if (this.rooms.includes(room._id)) return;
    this.rooms.push(room._id);
}

/**
 asset can be either a wallet, a token address, or a collection slug.
 
*/
userSchema.methods.track = function (asset) {
    if (this.tracking.indexOf(asset) >= 0) return;
    this.tracking.push(asset);
}

userSchema.methods.untrack = function (asset) {
    const idx = this.tracking.indexOf(asset);
    if (idx < 0) return;
    this.tracking.splice(idx, 1);
}

userSchema.methods.isTracking = function (asset) {
    return this.tracking.includes(asset);
}

userSchema.methods.blockFriend = function (friend) {
    if (this.blocked.includes(friend._id)) return;
    friend.unFriend(this);
    this.blocked.push(friend._id);
}

userSchema.methods.unblockFriend = function (friend) {
    const idx = this.blocked.indexOf(friend._id);
    if (idx < 0) return;

    this.blocked.splice(idx, 1);
}

const model = mongoose.model('User', userSchema);

module.exports = model;

