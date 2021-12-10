class Room {
    /**
     * @param {string} authorId - id of user who created the room
     * @param {string} name - room name
     * @param {string} [desc] - room description
     * @param {array} [users] - list of users added to room on creation
     * @param {string} [icon] - path to room icon img
     */
    constructor (authorId, name, desc = '', users = [], icon = '') {
        this.name = name;
        this.desc = desc;
        this.icon = icon; // TODO: Should generate room icon if not set
        this.author = authorId;
        this.admins = [authorId];
        this.users = users;
        this.users.push(authorId); // add author to users as well.
        this.joinRequests = []; // users that requested to join room
    }

    // Storage Functions

    /**
     * Save room data as JSON string
     * @returns {JSON} - json string with room data
     */
    toJSON () {
        const json = JSON.stringify(
            {
                _id: this._id,
                name: this.name,
                created: this.created,
                desc: this.desc,
                icon: this.icon,
                author: this.author,
                admins: this.admins,
                users: this.users
            }
        );
        return json;
    }

    /**
     * Load room data from json string
     * @param {JSON} json - json string with room data
     */
    loadJSON (json) {
        let data = {};
        try {
            data = JSON.parse(json);
            if (data !== undefined) {
                this.setName(data.name);
                this.setDescription(data.desc);
                this.setIcon(data.icon);
                this.author = data.author;
                this.admins = data.admins;
                this.users = data.users;
            }
        } catch (e) {
            data = this;
        }
    }

    // User Handling
    // Note: Should check if user has the privileges to perform the given actions

    /**
     * Add user to room
     * @param {string} reqId - id of user making add request
     * @param {string} newUserId - id of added user
     */
    addUser (reqId, newUserId) {
        if (this.isAdmin(reqId) && !this.isMember(newUserId)) {
            this.users.push(newUserId);
        }
    }

    /**
     * Remove user from room
     * @param {string} reqId - id of user making remove request
     * @param {string} userId - id of removed user
     */
    removeUser (reqId, userId) {
        const userIsMember = this.isMember(userId); // deleting actual room member
        const reqIsAuthor = this.isAuthor(reqId); // author can remove everyone
        const adminDeletingUser = this.isAdmin(reqId) && !this.isAdmin(userId);

        if (userIsMember && (reqIsAuthor || adminDeletingUser)) {
            const idx = this.users.indexOf(userId);
            this.users.splice(idx, 1);

            if (this.isAdmin(userId)) {
                const idx = this.admins.indexOf(userId);
                this.admins.splice(idx, 1);
            }
        }
    }

    /**
     * Check if user is admin
     * @param {string} userId - id of user to check
     * @returns {boolean} whether user is admin or not
     */
    isAdmin (userId) {
        return this.admins.includes(userId);
    }

    /**
     * Set user as admin
     * @param {string} reqId - id of user making request
     * @param {string} userId - user id
     */
    setAsAdmin (reqId, userId) {
        if (this.isAdmin(reqId) && this.isMember(userId) && !this.isAdmin(userId)) {
            this.admins.push(userId);
        }
    }

    /**
     * Remove admin privileges from user
     * @param {string} reqId - id of user making request
     * @param {string} userId - user id
     */
    removeAdmin (reqId, userId) {
        const isAdmin = this.isAdmin(userId);
        const reqHasPrivileges = this.isAuthor(reqId);
        if (isAdmin && reqHasPrivileges) {
            const idx = this.admins.indexOf(userId);
            this.admins.splice(idx, 1);
        }
    }

    /**
     * Check if user with given id is a member of group
     * @param {string} userId - user id
     * @returns {boolean} - whether a given user is a member of this room
     */
    isMember (userId) {
        return this.users.includes(userId);
    }

    /**
     * Check if given user is the room creator (ie, has max privileges)
     * @param {string} userId - user id
     * @returns {boolean} whether user is the creator or not
     */
    isAuthor (userId) {
        return this.author === userId;
    }

    /**
     * Get id assigned to this room
     * @returns {integer} - id of the given room
     */
    getRoomId () {
        return this._id;
    }

    /**
     * Get size of room (ie, the number of users it has, including author)
     * @returns {integer} - room size
     */
    getRoomSize () {
        return this.users.length;
    }

    // Room Settings
    // Should check if user has privileges for a given action

    /**
     * Set room icon
     * @param {string} newIcon - new room icon
     * @param {string} reqId - id of user making request
     */
    setIcon (reqId, newIcon) {
        if (this.isAdmin(reqId)) {
            this.icon = newIcon;
        }
    }

    /**
     * Set room name
     * @param {string} newName - new room name
     * @param {string} reqId - id of user making request
     */
    setName (reqId, newName) {
        if (this.isAdmin(reqId)) {
            this.name = newName;
        }
    }

    /**
     * Set room description
     * @param {string} newDesc - new room description
     * @param {string} reqId - id of user making request
     */
    setDescription (reqId, newDesc) {
        if (this.isAdmin(reqId)) {
            this.desc = newDesc;
        }
    }


    // Joining room

    /**
     * Make a request to join the room
     * @param {string} userId - id of user who wants to join
     */
    requestToJoin (userId) {
        if (!this.isMember(userId) && !this.isRequestingToJoin(userId)) {
            this.joinRequests.push(userId);
        }
    }

    /**
     * Check if user has sent a join request
     * @param {string} userId - id of user who (may have) sent join request
     * @returns {boolean} - whether a user has sent a join request for this room
     */
    isRequestingToJoin (userId) {
        return this.joinRequests.includes(userId);
    }

    /**
     * Accept join request
     * @param {string} userId - id of user who sent join request
     */
    acceptJoinRequest (userId) {
        if (this.isRequestingToJoin(userId)) {
            // remove user from request array
            const idx = this.joinRequests.indexOf(userId);
            this.joinRequests.splice(idx, 1);
            // add user to users list
            this.users.push(userId)
        }
    }
}

module.exports = Room;
