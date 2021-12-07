const rooms = require('../rooms');
const assert = require('chai').assert
const expect = require('chai').expect

// Test values
const userId0 = 0;
const userId1 = 1;
const userId2 = 2;

describe('Rooms', function () {
    describe('Room creation', function () {
        it('room author is automatically set to admin', function () {
            // TODO
        })

        it('should create empty room', function () {
            // TODO
        });

        it('should create room with populated user list', function () {
            // TODO
        })

        it('room id is unique', function () {
            // TODO
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