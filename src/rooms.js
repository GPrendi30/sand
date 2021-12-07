class Room {
    /**
     * @param {string} authorId - id of user who created the room
     * @param {string} name - room name
     * @param {string} [desc] - room description
     * @param {array} [users] - list of users added to room on creation
     * @param {string} [icon] - path to room icon img
     */
    constructor (authorId, name, desc = '', users = [], icon = '') {
        this._id = 0; // TODO: room id generation
        this.name = name;
        this.created = Date.now();
        this.desc = desc;
        this.icon = icon; // TODO: Should generate room icon if not set
        this.author = authorId;
        this.admins = [authorId];
        this.users = users.push(authorId);
        // TODO: Store sent and received room join requests
    }

    // Storage Functions

    /**
     * Save room data as JSON string
     * @returns {JSON} - json string with room data
     */
    toJSON () {
        // TODO
    }

    /**
     * Load room data from json string
     * @param {JSON} json - json string with room data
     */
    loadJSON (json) {
        // TODO
    }

    // User Handling
    // Note: Should check if user has the privileges to perform the given actions

    /**
     * Add user to room
     * @param {string} newUserId - id of added user
     */
    addUser (newUserId) {
        // TODO
    }

    /**
     * Remove user from room
     * @param {string} user - id of removed user
     */
    removeUser (userId) {
        // TODO
    }

    /**
     * Check if user is admin
     * @param {string} userId - id of user to check
     * @returns {boolean} whether user is admin or not
     */
    isAdmin (userId) {
        // TODO
        return false;
    }

    /**
     * Set user as admin
     * @param {string} userId - user id
     */
    setAsAdmin (userId) {
        // TODO
    }

    /**
     * Remove admin privileges from user
     * @param {string} userId - user id
     */
    removeAdmin (userId) {
        // TODO
    }

    /**
     * Check if given user is the room creator (ie, has max privileges)
     * @param {string} userId - user id
     * @returns {boolean} whether user is the creator or not
     */
    isAuthor (userId) {
        // TODO
        return false;
    }

    /**
     * Get size of room (ie, the number of users it has, including author)
     * @returns {integer} - room size
     */
    getRoomSize () {
        // TODO
    }

    // Room Settings

    /**
     * Set room icon
     * @param {string} newIcon - new room icon
     */
    setIcon (newIcon) {
        // TODO
    }

    /**
     * Set room name
     * @param {string} newName - new room name
     */
    setName (newName) {
        // TODO
    }

    /**
     * Set room description
     * @param {string} newDesc - new room description
     */
    setDescription (newDesc) {
        // TODO
    }
}

module.exports = {
    Room
};
