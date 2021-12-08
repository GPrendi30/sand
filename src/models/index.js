const mongodb = require('mongodb')
const mongoose = require('mongoose')
const MongoClient = mongodb.MongoClient
const config = require('config').get('database')
const process = require('process')

require('dotenv').config() // read .env file

// mongodb uri, config.uri if its local db or MONGODB_URI if its heroku
const uri = (config.uri || process.env.MONGODB_URI) + '/' + config.db_name
const dbName = config.db_name

/* connect to mongodb
  - uri is the mongodb uri
  - dbName is the name of the database
*/
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(connection => {
        console.log('Connected to MongoDB through Mongoose')
        console.log(`Database: ${dbName}`)
    })
    .catch(err => { console.log(err) })

mongoose.connection.on('error', err => {
    console.log('Mongodb error:', err);
});
