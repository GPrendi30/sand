const Room = require('../rooms');
const assert = require('chai').assert;
const expect = require('chai').expect;

// Test values
const userId0 = 0;
const userId1 = 1;
const userId2 = 2;
const defaultIcon = ''; //TODO: Make default icon accesible on rooms

describe('Rooms', function () {
    describe('Room creation', function () {
        it('unspecified room settings are set to default values', function () {
            const room = new Room(userId0, 'room0');
            assert.equal(room.name, 'room0');
            assert.equal(room.desc, '');
            assert.equal(room.icon, defaultIcon);
        })

        it('room author is automatically set to admin', function () {
            const room = new Room(userId0, 'room0');
            assert.strictEqual(room.isMember(userId0), true);
            assert.strictEqual(room.isAdmin(userId0), true);
        })

        it('should create empty room', function () {
            const room = new Room(userId0, 'room0');
            expect(room.getRoomSize()).to.equal(1);
        });

        it('should create room with populated user list', function () {
            const room = new Room(userId0, 'room0', undefined, [userId1, userId2]);
            expect(room.getRoomSize()).to.equal(3);
        })

        it('room id is unique', function () {
            // TODO: Test once rooms are linked with database 
        })

        it('room size is at least 1', function () {
            const room = new Room(userId0, "room0");
            assert.equal(room.getRoomSize(), 1);
        })
    })

    describe('User/Room Interaction', function () {
        it('non-members cannot make changes to room', function () {
            const room = new Room(userId0, 'room0');
            const name = room.name;
            const icon = room.icon;
            const desc = room.desc;
            room.setName(userId1, "An interesting room name");
            room.setIcon(userId1, "cool-icon.jpg");
            room.setDescription(userId1, "An interesting room description");
            assert.equal(room.name, name);
            assert.equal(room.icon, icon);
            assert.equal(room.desc, desc);
        })

        it('testing room join requesting', function () {
            const room = new Room(userId0, 'room0');
            // userId2 should not be member
            assert.isTrue(!room.isMember(userId2));

            // send join request
            room.requestToJoin(userId2);

            assert.isTrue(!room.isMember(userId2));
            assert.isTrue(room.isRequestingToJoin(userId2))

            // accept the join request
            room.acceptJoinRequest(userId2);

            // user finally a member !hooray!
            assert.isTrue(room.isMember(userId2));
            assert.isTrue(!room.isRequestingToJoin(userId2))

        })

        it('users may send only one room join request', function () {
            const room = new Room(userId0, 'room0');
            // userId2 should not be member
            assert.isTrue(!room.isMember(userId2));

            // send join request
            for (let i = 0; i < 100; i++) {
                room.requestToJoin(userId2);
            }
            assert.isTrue(!room.isMember(userId2));
            assert.isTrue(room.isRequestingToJoin(userId2))
            // check userId2 only appears once on requests array
            assert.equal(room.joinRequests.filter(x => x === userId2).length, 1);

            // accept the join request
            room.acceptJoinRequest(userId2);

            // user finally a member !hooray!
            assert.isTrue(room.isMember(userId2));
            assert.isTrue(!room.isRequestingToJoin(userId2))

        })

        it('accepted join requests get added as room members', function () {
            const room = new Room(userId0, 'room0');

            room.requestToJoin(userId1);
            assert.isTrue(!room.isMember(userId1));
            assert.isTrue(room.isRequestingToJoin(userId1));

            room.acceptJoinRequest(userId1);
            // check userId0 has switched from joinRequests array to users array
            assert.isTrue(room.isMember(userId1));
            assert.isTrue(!room.isRequestingToJoin(userId1));
        })

    });

    describe('User/Admin Interaction', function () {

        it('user cannot add members to room', function () {
            const users = [userId1, userId2];
            const newUserId = "123456";
            const room = new Room(userId0, 'room0', undefined, users);
            assert.equal(room.getRoomSize(), 3);
            room.addUser(userId1, newUserId);
            assert.strictEqual(room.isMember(newUserId), false);
            assert.equal(room.getRoomSize(), 3);
        })

        it('user cannot remove members from room', function () {
            const users = [userId1, userId2];
            const room = new Room(userId0, 'room0', undefined, users);
            assert.equal(room.getRoomSize(), 3);
            room.removeUser(userId1, userId2);
            assert.strictEqual(room.isMember(userId2), true);
            assert.equal(room.getRoomSize(), 3);
        })

        it('non-room members cannot be set as admins', function () {
            const users = [userId1, userId2];
            const newUserId = "123456";
            const room = new Room(userId0, 'room0', undefined, users);
            assert.equal(room.admins.length, 1);
            assert.equal(room.isMember(newUserId), false);
            room.setAsAdmin(room.author, newUserId);
            assert.equal(room.admins.length, 1);
            assert.equal(room.isAdmin(newUserId), false);
        })

        it('room creator cannot be removed from room', function () {
            const users = [userId1, userId2];
            const room = new Room(userId0, 'room0', undefined, users);
            assert.equal(room.users.length, 3);
            room.setAsAdmin(room.author, userId1);
            assert.equal(room.admins.length, 2);
            room.removeUser(userId1, room.author);
            assert.equal(room.users.length, 3);
            assert.equal(room.admins.length, 2);
            assert.equal(room.isMember(room.author), true);
        })

        it('author can remove everyone', function () {
            const users = [userId1, userId2];
            const room = new Room(userId0, 'room0', undefined, users);
            room.setAsAdmin(room.author, userId1);

            room.removeUser(room.author, userId2); // regular user
            assert.equal(room.isMember(userId2), false);
            room.removeUser(room.author, userId1); // admin
            assert.equal(room.isMember(userId1), false);
        })

        it('admins cannot remove each others privileges', function () {
            const users = [userId1, userId2];
            const room = new Room(userId0, 'room0', undefined, users);
            room.setAsAdmin(room.author, userId1);
            room.setAsAdmin(room.author, userId2);
            room.removeAdmin(userId1, userId2);
            assert.equal(room.isAdmin(userId2), true);
        })

        it('admins cannot delete each other', function () {
            const users = [userId1, userId2];
            const room = new Room(userId0, 'room0', undefined, users);
            room.setAsAdmin(room.author, userId1);
            room.setAsAdmin(room.author, userId2);
            room.removeUser(userId1, userId2);
            assert.equal(room.isMember(userId2), true);
        })

        it('removing a user from rooms also removes them as an admin', function () {
            const users = [userId1, userId2];
            const room = new Room(userId0, 'room0', undefined, users);
            room.setAsAdmin(room.author, userId2); // userId2 is admin
            assert.equal(room.getRoomSize(), 3);
            assert.equal(room.admins.length, 2);
            room.removeUser(userId0, userId2); // only author can remove admins
            assert.equal(room.isMember(userId2), false);
            assert.equal(room.isAdmin(userId2), false);
            assert.equal(room.getRoomSize(), 2);
            assert.equal(room.admins.length, 1);
        })

        it('same user cannot be added twice', function () {
            const room = new Room(userId0, 'room0');
            room.addUser(room.author, userId1);
            assert.equal(room.getRoomSize(), 2)
            for (let i = 0; i < 100; i++) {
                room.addUser(room.author, userId1);
            }
            assert.equal(room.getRoomSize(), 2)
        })
    })
});