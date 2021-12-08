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
            let roomIds = [];
            for(let i = 0; i < 100; i++) {
                roomIds.push(new Room().getRoomId());
            }
            for(let i = 0; i < 100; i++) {
                for(let j = i + 1; j < 100; j++) {
                    expect(roomIds[i]).to.not.equal(roomIds[j]);
                }
            }
        })

        it('cannot create room with way too many users', function () {
            // TODO
        })

        it('cannot create room with more users than specified', function () {
            // TODO
        })

        it('room size is at least 1', function () {
            // TODO
        })

        it('room size cannot be greater than limit', function () {
            // TODO
        })

        it('cannot reduce room size if number of current members is greater', function () {
            // TODO
        })
    })

    describe('User/Room Interaction', function() {
        it('regular user cannot change room name', function () {
            // TODO
        })

        it('regular user cannot change room description', function () {
            // TODO
        })

        it('regular user cannot change room icon', function () {
            // TODO
        })

        it('users may send only one room join request', function () {
            // TODO
        })

        it('users cannot be added to a room that is full', function () {
            // TODO
        })
        
    });

    describe('User/Admin Interaction', function () {
        it('user cannot add members to room', function () {
            // TODO
        })

        it('user cannot remove members to room', function () {
            // TODO
        })

        it('room creator cannot be removed from room', function () {
            // TODO
        })

        it('author can remove everyone', function () {
            // TODO
        })

        it('author can remove admin privileges', function () {
            // TODO
        })

        it('admins cannot remove each others privileges', function () {
            // TODO
        })

        it('admins cannot delete each other', function () {
            // TODO
        })

        it('same user cannot be added twice', function () {
            // TODO
        })

        it('admins may only send one room invite request per person', function () {
            // TODO
        })
    })
});