const mongoose = require('mongoose');
const { transformAuthInfo } = require('passport');
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
    return this.members.includes(user)
}

room.methods.isAdmin = function (user) {
    return this.admins.includes(user)
}

room.methods.isAuthor = function (author) {
    return this.author === author
}

room.methods.addInitialAdmin = function (author) {
    this.admins.push(author)
}

room.methods.addAdmin = function (admin, user) {
    if (!this.isAdmin(user) && this.isAdmin(admin) && this.isMember(user)) {
        this.admins.push(user)
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
        this.members.push(user)
    }
}

room.methods.removeMember = function (admin, user) {
    if ((this.isAdmin(admin) || this.isAuthor(admin)) && !this.isAdmin(user)) {
        if (this.isMember(user)) {
            const index = this.members.indexOf(user)
            this.users.splice(index, 1)
        }
    }
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
    return this.joinRequests.includes(user);
}

room.methods.requestToJoin = function (user) {
    if (!this.isMember(user) && this.isRequestingToJoin(user)) {
        this.joinRequests.push(user)
    }
}

room.methods.accpetJoinRequest = function (user) {
    if (this.isRequestingToJoin(user)) {
        const index = this.joinRequests.indexOf(user)
        this.joinRequests.splice(index, 1)
        this.users.push(user)
    }
}


module.exports = mongoose.model('Room', room);
