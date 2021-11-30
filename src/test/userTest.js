const assert = require('chai').assert
const expect = require('chai').expect
// const describe = require('chai').describe
const request = require('supertest')('http://localhost:3000')
const users = [] //array of user

function createUser(id, username, password, email, name, surname, wallet, collection, friendlist, settings, ppic, bio, tracking) {
    const user = {
        '_id': id,
        'username': username,
        'password': password,
        'email': email,
        'name': name,
        'surname': surname,
        'wallet': wallet,
        'collection': collection,
        'friendlist': friendlist,
        'settings': settings,
        'ppic': ppic,
        'bio': bio,
        'tracking': tracking
    }
    return user
}

function addUser (user) {
    users.push(user)
}

const dummyUser = createUser('id', 'username', 'password', 'email', 'name', 'surname', 'wallet', [], [], {currency : 'eth', mode : 'dark'}, 'ppic', 'bio', [])
addUser(dummyUser)

const _id = dummyUser._id

describe('Testing user routes', function () {
    describe('GET /user/:_id', function () {
        it('the user metadata should be found', function (done) {
            request
                .get('/user/' + _id)
                .set('Accept', 'application/json')
                .send()
                .expect(200)
                .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
                .end(function (err, res) {
                    if (err) return done(err)
                    const user = JSON.parse(res.text)
                    expect(user._id).to.equal(_id)
                    expect(user.username).to.equal('username')
                    expect(user.password).to.equal('password')//probably we don't want this
                    expect(user.email).to.equal('email')
                    expect(user.name).to.equal('name')
                    expect(user.surname).to.equal('surname')
                    expect(user.wallet).to.equal('wallet')
                    expect(user.collection).to.be.an('array').that.is.empty
                    expect(user.friendlist).to.be.an('array').that.is.empty
                    expect(user.settings).to.include({currency: 'eth', mode: 'dark' })
                    expect(user.ppic).to.equal('ppic')
                    expect(user.bio).to.equal('bio')
                    expect(user.tracking).to.be.an('array').that.is.empty
                    done()
                })
        })
        it('a random user should be not found ', function (done) {

            request
                .get('/user/' + Math.random())
                .send()
                .expect(404, done);
        });
    })

})
