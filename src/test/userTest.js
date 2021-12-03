const assert = require('chai').assert
const expect = require('chai').expect
const rewire = require('rewire')
const userJs = rewire('../routes/user.js')
const models = require('../models').model
const ObjectId = require('mongodb').ObjectId
const express = require('express');
const router = express.Router();
const request = require('supertest')('http://localhost:3000')

//setting up test data in db
function createUser (username, password, email, name, surname, wallet, collection, friendlist, settings, ppic, bio, tracking) {
  const user = {
    //_id: id,
    username: username,
    password: password,
    email: email,
    name: name,
    surname: surname,
    wallet: wallet,
    collection: collection,
    friendlist: friendlist,
    settings: settings,
    ppic: ppic,
    bio: bio,
    tracking: tracking,
    recentlyviewed: [] 	
  }
  return user
}

// create users for tests
const dummyUser = createUser( 'username', 'password', 'email', 'name', 'surname', 'wallet', [], [], { currency: 'eth', mode: 'dark' }, 'ppic', 'bio', [],[])
const dummyUser2 = createUser( 'username2', 'password', 'email', 'name', 'surname', 'wallet', [], [], { currency: 'eth', mode: 'dark' }, 'ppic', 'bio', [],[])

var initialSize=0 //used to check POST/PUT/DELETE 
const new_id = '42a802fd2ac32b114627c118'//used to check POST/PUT/DELETE 

// add users to db

describe('Connecting to database', function () {
  before(function (done) {
    let attempts = 0
  async function check () {
    if (models.db && models.users) {
      console.log("connected")
      models.users.insertOne(dummyUser)
      .then(function(){done()}).catch(err=>{console.log(err)})
    } else {
      console.log('Trying to connect')
      attempts++;
      if (attempts < 10) {
        setTimeout(check, 500)
      } else {
        throw new Error('Unable to connect the test to the database')
      }
    }
  }
  
  check()
  })
  
  describe('Testing user routes', function () {
    
    describe('GET /user/_id', function () {
      it('the user metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
          console.log('/user/'+ result._id)
          request
          .get('/user/'+ result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const user = JSON.parse(res.text)
            expect(user._id).to.equal(''+result._id) //result_id =new ObjectId("61a8013882dda60a14619eeb")
            expect(user.username).to.equal('username')
            expect(user.password).to.equal('password')// probably we don't want this
            expect(user.email).to.equal('email')
            expect(user.name).to.equal('name')
            expect(user.surname).to.equal('surname')
            expect(user.wallet).to.equal('wallet')
            expect(user.collection).to.be.an('array').that.is.empty
            expect(user.friendlist).to.be.an('array').that.is.empty
            expect(user.settings).to.include({ currency: 'eth', mode: 'dark' })
            expect(user.ppic).to.equal('ppic')
            expect(user.bio).to.equal('bio')
            expect(user.tracking).to.be.an('array').that.is.empty
            done()
          })})
        
      })

      it('a random user should be not found ', function (done) {
        request
          .get('/user/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it(' the request do not accept json -> bad request', function (done) {
        request
          .get('/user/42a802fd2ac32b114627c148')
          .set('Accept', 'html')
          .send()
          .expect(406, done)
      })

      it('wrong id should return 404 not found', function (done) {
        request
          .get('/user/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('GET /user/', function () {
      it('the users metadata should be found', function (done) {
        models.users.find().toArray().then(result=>{
        request
          .get('/user/')
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const fUsers = JSON.parse(res.text)
            assert(result);
            expect(JSON.stringify(fUsers)).to.equal(JSON.stringify(result))
            done()
          }) })
      })

      it(' the request do not accept json -> bad request', function (done) {
        request
          .get('/user')
          .set('Accept', 'html')
          .send()
          .expect(406, done)
      })
      it('wrong id should return 404 not found', function (done) {
        request
          .get('/user/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('GET /user/settings/:_id', function () {
      it('the user settings metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
        request
          .get('/user/settings/' + result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const settings = JSON.parse(res.text)
            //console.log('settings'+settings)
             assert(result);
             assert(settings);
             expect(JSON.stringify(settings)).to.equal(JSON.stringify(result.settings))
            done()
          }) })
      })

      it('a random user settings should be not found ', function (done) {
        request
          .get('/user/settings/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it(' the request do not accept json -> bad request', function (done) {
        request
          .get('/user/settings/42a802fd2ac32b114627c148')
          .set('Accept', 'html')
          .send()
          .expect(406, done)
      })
      it('wrong id should return 404 not found', function (done) {
        request
          .get('/user/settings/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('GET /user/assets/:_id', function () {
      it('the user assets metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
        request
          .get('/user/assets/' + result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const assets = JSON.parse(res.text)
              assert(result)
              assert(result.collection);
              assert(assets);
              expect(JSON.stringify(assets)).to.equal(JSON.stringify(result.collection))
            done()
          }) })
      })

      it('a random user assets should be not found ', function (done) {
        request
          .get('/user/assets/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it(' the request do not accept json -> bad request', function (done) {
        request
          .get('/user/assets/42a802fd2ac32b114627c148')
          .set('Accept', 'html')
          .send()
          .expect(406, done)
      })
      it('wrong id should return 404 not found', function (done) {
        request
          .get('/assets/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('GET /user/friends/:_id', function () {
      it('the user friends metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
        request
          .get('/user/friends/' + result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const friends = JSON.parse(res.text)
            //console.log('friends' +friends)
              assert(result)
              assert(result.friendlist);
              assert(friends);
              expect(JSON.stringify(friends)).to.equal(JSON.stringify(result.friendlist))
            done()
          }) })
      })

      it('a random user firends should be not found ', function (done) {
        request
          .get('/user/friends/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it(' the request do not accept json -> bad request', function (done) {
        request
          .get('/user/friends/42a802fd2ac32b114627c148')
          .set('Accept', 'html')
          .send()
          .expect(406, done)
      })
      it('wrong id should return 404 not found', function (done) {
        request
          .get('/friends/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('GET /user/recentlyviewed/:_id', function () {
      it('the user recentlyviewed metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
        request
          .get('/user/recentlyviewed/' + result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const recentlyViewed = JSON.parse(res.text)
              assert(result)
              assert(result.recentlyviewed);
              assert(recentlyViewed);
              expect(JSON.stringify(recentlyViewed)).to.equal(JSON.stringify(result.recentlyviewed))
            done()
          }) })
      })

      it('a random user recentlyviewed should be not found ', function (done) {
        request
          .get('/user/recentlyviewed/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it(' the request do not accept json -> bad request', function (done) {
        request
          .get('/user/recentlyviewed/42a802fd2ac32b114627c148')
          .set('Accept', 'html')
          .send()
          .expect(406, done)
      })
      it('wrong id should return 404 not found', function (done) {
        request
          .get('/recentlyviewed/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('GET /user/following/:_id', function () {
      it('the user following metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
        request
          .get('/user/following/' + result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const following = JSON.parse(res.text)
              assert(result)
              assert(result.tracking);
              assert(following);
              expect(JSON.stringify(following)).to.equal(JSON.stringify(result.tracking))
            done()
          }) })
      })

      it('a random user following should be not found ', function (done) {
        request
          .get('/user/following/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it('wrong id should return 404 not found', function (done) {
        request
          .get('/user/following/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })

    })

    describe('GET /edit/:_id', function () {
      it('the edit metadata should be found', function (done) {
        models.users.findOne({username:'username'}).then(result=>{
          request
          .get('/user/edit/'+ result._id)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
          .end(function (err, res) {
            if (err) return done(err)
            const user = JSON.parse(res.text)
            expect(user._id).to.equal(''+result._id) //result_id =new ObjectId("61a8013882dda60a14619eeb")
            expect(user.username).to.equal('username')
            expect(user.password).to.equal('password')// probably we don't want this
            expect(user.email).to.equal('email')
            expect(user.name).to.equal('name')
            expect(user.surname).to.equal('surname')
            expect(user.wallet).to.equal('wallet')
            expect(user.collection).to.be.an('array').that.is.empty
            expect(user.friendlist).to.be.an('array').that.is.empty
            expect(user.settings).to.include({ currency: 'eth', mode: 'dark' })
            expect(user.ppic).to.equal('ppic')
            expect(user.bio).to.equal('bio')
            expect(user.tracking).to.be.an('array').that.is.empty
            done()
          })})
        
      })
      it('a random user edit should be not found ', function (done) {
        request
          .get('/edit/42a802fd2ac32b114627c148')
          .send()
          .expect(404, done)
      })

      it('wrong id should return 404 not found', function (done) {
        request
          .get('/user/edit/wrong_id')
          .set('Accept', 'application/json')
          .send()
          .expect(404, done)
      })
    })

    describe('POST /user/', function() {

      it('check initial user collection size', function(done) {
          request
              .get('/user/')
              .set('Accept', 'application/json')
              .send()
              .expect(200)
              .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
              .end((err, res) => {
                  if (err) return done(err);

                  const fUsers = JSON.parse(res.text);
                  //check the initial size of the content present in the server
                  initialSize = fUsers.length;
                  done();
              });
      });

      it('should create a new user', function(done) {

          request
              .post('/user/')
              .send(dummyUser2)
              .set('Encryption-Type',"multipart/form-data")
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
              .expect(201)
              .end(function(err, res) {
                  if (err) return done(err);

                  //console.log(res.text);

                  const user = JSON.parse(res.text);

                  //console.log(user);
                  expect(user._id).to.not.be.undefined //result_id =new ObjectId("61a8013882dda60a14619eeb")
                  expect(user.username).to.equal(dummyUser2.username)
                  expect(user.password).to.equal(dummyUser2.password)// probably we don't want this
                  expect(user.email).to.equal(dummyUser2.email)
                  expect(user.name).to.equal(dummyUser2.name)
                  expect(user.surname).to.equal(dummyUser2.surname)
                  expect(user.wallet).to.equal(dummyUser2.wallet)
                  expect(user.collection).to.be.an('array').that.is.empty
                  expect(user.friendlist).to.be.an('array').that.is.empty
                  expect(user.settings).to.include({ currency: 'eth', mode: 'dark' })
                  expect(user.ppic).to.equal(dummyUser2.ppic)
                  expect(user.bio).to.equal(dummyUser2.bio)
                  expect(user.tracking).to.be.an('array').that.is.empty
                  expect(user.recentlyviewed).to.be.an('array').that.is.empty

                  done()
              })
      })

      it('check user collection size after adding the user', function(done) {
        request
            .get('/user/')
            .set('Accept', 'application/json')
            .send()
            .expect(200)
            .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
            .end((err, res) => {
                if (err) return done(err);

                const fUsers = JSON.parse(res.text);
                //check the initial size of the content present in the server
                finalSize = fUsers.length;
                expect(finalSize).to.equal(initialSize+1)
                done();
            });
    });

    it('should being added to the db and retrivable', function(done) {
      request
      models.users.findOne({username:'username2'}).then(result=>{
        request
        .get('/user/'+ result._id)
        .set('Accept', 'application/json')
        .send()
        .expect(200)
        .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
        .end(function (err, res) {
          if (err) return done(err)
          const user = JSON.parse(res.text)
          expect(user._id).to.not.be.undefined //result_id =new ObjectId("61a8013882dda60a14619eeb")
          expect(user.username).to.equal(dummyUser2.username)
          expect(user.password).to.equal(dummyUser2.password)// probably we don't want this
          expect(user.email).to.equal(dummyUser2.email)
          expect(user.name).to.equal(dummyUser2.name)
          expect(user.surname).to.equal(dummyUser2.surname)
          expect(user.wallet).to.equal(dummyUser2.wallet)
          expect(user.collection).to.be.an('array').that.is.empty
          expect(user.friendlist).to.be.an('array').that.is.empty
          expect(user.settings).to.include({ currency: 'eth', mode: 'dark' })
          expect(user.ppic).to.equal(dummyUser2.ppic)
          expect(user.bio).to.equal(dummyUser2.bio)
          expect(user.tracking).to.be.an('array').that.is.empty
          expect(user.recentlyviewed).to.be.an('array').that.is.empty
          done()
        })
      })
    })
    it('wrong id should return 404 not found', function (done) {
      request
        .post('/user/wrong_id')
        .set('Accept', 'application/json')
        .send()
        .expect(404, done)
    })
  })

  describe('PUT /user/:id', function() {

    it(`the new user should be found before updating it`, function(done) {
      models.users.findOne({username:'username2'}).then(result=>{
        request
            .get('/user/' + result._id)
            .send()
            .expect(200, done);
      })
    });


    it('updating an existing user should change its name and bio', function(done) {
      models.users.findOne({username:'username2'}).then(result=>{
          let updatedName = "updated Name"
          let updatedBio = "updated bio"
          dummyUser2.name=updatedName
          dummyUser2.bio=updatedBio 
          dummyUser2._id = ''+result._id
          // console.log(dummyUser2._id)
          // console.log(result._id)
          request
            .put('/user/'+result._id)
            .send(dummyUser2)
            .set('Encryption-Type',"multipart/form-data")
            .set('Accept', 'application/json')
            .expect(200 || 201)
            .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
            .end(function(err, res) {
                  if (err) return done(err);
                  const user = JSON.parse(res.text);
                  expect(user.name).to.equal(updatedName);
                  expect(user.bio).to.equal(updatedBio);
                  done()
            })
        })
      });
      
    it(`create a new user given the id=`+ new_id, function(done) {
        request
            .put('/user/' + new_id )
            .set('Encryption-Type',"multipart/form-data")
            .set('Accept', 'application/json')
            .send(dummyUser)
            .expect( 200 | 201 )
            .expect('Content-Type', /json/, 'it should respond with Content-Type: application/json')
            .end(function(err, res) {
                if (err) return done(err);
                 const user = JSON.parse(res.text)
                 expect(user.username).to.equal('username')
                 expect(user.password).to.equal('password')// probably we don't want this
                 expect(user.email).to.equal('email')
                 expect(user.name).to.equal('name')
                 expect(user.surname).to.equal('surname')
                 expect(user.wallet).to.equal('wallet')
                 expect(user.collection).to.be.an('array').that.is.empty
                 expect(user.friendlist).to.be.an('array').that.is.empty
                 expect(user.settings).to.include({ currency: 'eth', mode: 'dark' })
                 expect(user.ppic).to.equal('ppic')
                 expect(user.bio).to.equal('bio')
                 expect(user.tracking).to.be.an('array').that.is.empty
                done()
            });

    });

    it('the create user with id should be fetchable id = '+ new_id, function(done) {
      models.users.findOne({_id : new_id}).then(result=>{
        request
            .get('/user/' + new_id)
            .send()
            .expect(200, done)
      })
    });

    

  });
  describe('DELETE /user/:id', function() {

    it('the user should be found before deleting it (using' +new_id+')', function(done) {
        request
            .get('/user/' + new_id)
            .set('Accept', 'application/json')
            .send()
            .expect(200, done);
    });

    it('deleting the new user removes it from DB', function(done) {
        request
            .delete('/user/' + new_id)
            .send()
            .expect(204, done);
    });

    it('the deleted user : ' +new_id + ' should not be found', function(done) {
        request
            .get('/user/'+ new_id)
            .set('Accept', 'application/json')
            .send()
            .expect(404, done);
    });
    
  });
})
//clean up test DB
after(function (done) {
  models.db.collection('users').drop().then(() => {
    console.log('finished')
    done();
  }).catch((err) => { throw err });
})

})