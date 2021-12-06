const { hashUserPassword } = require('../login');
const assert= require('assert');

describe('Test password hashing', function() {

    this.timeout(5000);

    it('Should hash the user password', (done) => {
        let userBefore = { username: "test", password: "test", email: "test"};
        hashUserPassword(userBefore)
        .then((userAfter) => {
            assert.equal(userBefore.username, userAfter.username);
            assert.equal(userBefore.email, userAfter.email);
            assert.notEqual(userBefore.password, userAfter.password);
            done();
        })
        .catch((err) => {
            done(err);
        })
        
    });

});