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
    },
    joinRequests: [] // TODO ADD This
}, { timestamps: true });

room.methods.isMember = function (user) {
    return this.members.includes(user._id)
}

room.methods.isAdmin = function (user) {
    return this.admins.includes(user._id)
}

room.methods.isAuthor = function (author) {
    return this.author === author._id
}

room.methods.addInitialAdmin = function (author) {
    author.addRoom(this);
    this.admins.push(author._id)
}

room.methods.addAdmin = function (admin, user) {
    if (!this.isAdmin(user) && this.isAdmin(admin) && this.isMember(user)) {
        user.addRoom(this);
        this.admins.push(user._id)
    }
}

room.methods.removeAdmin = function (author, admin) {
    if (this.isAuthor(author) && this.isAdmin(admin)) {
        const index = this.admins.indexOf(admin)
        this.admins.splice(index, 1)
    }
}


room.methods.addMember = function(admin, user) {
    if (this.isAdmin(admin) && !this.isMember(user)) {
        user.addRoom(this);
        this.members.push(user._id);
    }
}

room.methods.removeMember = function (admin, user) {
    if ((this.isAdmin(admin) || this.isAuthor(admin)) && !this.isAdmin(user)) {
        if (this.isMember(user)) {
            const index = this.members.indexOf(user._id)
            this.users.splice(index, 1)
        }
    }
}

room.methods.sendMessage = function (user, message) {
    this.chat.sendMessage(user, message);
}

room.methods.getRoomId = function () {
    return this._id
}

room.methods.getRoomSize = function () {
    return this.members.size
}

room.methods.setIcon = function(admin, newIcon) {
    if (this.isAdmin(admin) || this.isAuthor(admin)) {
        this.icon = newIcon
    }
}

room.methods.setName = function (admin, newName) {
    if (this.isAdmin(admin) || this.isAuthor(admin)) {
        this.name = newName
    }
}

room.methods.setDescription = function (admin, newDesc) {
    if (this.isAdmin(admin) || this.isAuthor(admin)) {
        this.description = newDesc;
    }
}

room.methods.isRequestingToJoin = function (user) {
    return this.joinRequests.includes(user._id);
}

room.methods.requestToJoin = function (user) {
    if (!this.isMember(user) && this.isRequestingToJoin(user)) {
        this.joinRequests.push(user._id)
    }
}

room.methods.accpetJoinRequest = function (user) {
    if (this.isRequestingToJoin(user)) {
        const index = this.joinRequests.indexOf(user)
        this.joinRequests.splice(index, 1)
        this.users.push(user._id)
    }
}


module.exports = mongoose.model('Room', room);
