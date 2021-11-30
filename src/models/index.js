const mongodb = require('mongodb')
// const ObjectId = mongodb.ObjectId
const MongoClient = mongodb.MongoClient
const config = require('config').get('database')
const process = require('process')

require('dotenv').config() // read .env file

// mongodb uri, config.uri if its local db or MONGODB_URI if its heroku
const uri = config.uri || process.env.MONGODB_URI
const dbName = config.db_name
const collectionName = config.collection_name

const model = {}

/* connect to mongodb
  - uri is the mongodb uri
  - dbName is the name of the database
  - collectionName is the name of the collection
*/
MongoClient
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    model.db = client.db(dbName)
    model.users = model.db.collection(collectionName)

    console.log('db_ready')
  })
  .catch(err => { console.log(err) })

exports.model = model // export model
