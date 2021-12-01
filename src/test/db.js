
const models = require('../models').model

const testCollection = 'test'
const testObject = {
  _id: '3333',
  name: 'test',
  age: '19'
}

describe('Connecting to database', function () {
  // block the tests until the model connects to the database
  before(function (done) {
    let attempts = 0

    async function check () {
      if (models.db && models.users) {
        done()
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

  it('database should create a new collection', function (done) {
    models.db.createCollection(testCollection, function (err) {
      if (err) {
        throw err
      }
      done()
    })
  })

  it('database should add an entry to the database', function (done) {
    models.db.collection(testCollection).insertOne(testObject, function (err) {
      if (err) {
        throw err
      }
      done()
    })
  })

  it('database should find the entry based on id', function (done) {
    models.db.collection(testCollection).findOne({ _id: '3333' }, function (err, result) {
      if (err) {
        throw err
      }
      if (result.name === 'test' && result.age === '19') {
        done()
      } else {
        throw new Error('Database returned wrong result')
      }
    })
  })

  it('database should delete the entry based on id', function (done) {
    models.db.collection(testCollection).deleteOne({ _id: '3333' }, function (err) {
      if (err) {
        throw err
      }
    })

    models.db.collection(testCollection).findOne({ _id: '3333' }, function (err, result) {
      if (err) {
        throw err
      }
      if (result == undefined) {
        done()
      } else {
        throw new Error('Database deleted the wrong object')
      }
    })
  })

  after(function (done) {
    models.db.collection(testCollection).drop().then(() => {
      console.log('finished')
      done();
    }).catch((err) => { throw err });
  })
})
