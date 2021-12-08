const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);

const config = require('config').get('cache')
const redisPort = config.redisPort
const redisHost = config.redisHost
require('dotenv').config()

let opts = {
    connectTimeout: 3000,
    maxRetriesPerRequest: 0,
    retryStrategy: function (times) {
        if (times > 3) {
            console.log('redisRetryError', 'Redis reconnect exhausted after 3 retries.');
            return null;
        }
        return 200;
    }
}

// if production there is a different configuration
if (process.env.NODE_ENV === 'production') {
    opts = {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        ...opts
    }
} else {
    opts = {
        host: redisHost,
        port: redisPort,
        ...opts
    };
}



/**
 * Redis client for session storage
 * Currently supports local REDIS
 */
let client;
let store;

try {
    client = new Redis(opts);

    store = new RedisStore({ client: client });
} catch (err) {
    console.log('Redis connection failed');
    console.log('redisError:', err);
} 

client.on('connect', function () {
    console.log('Redis client connected');
});

client.on('error', function () {
    console.log('Redis client error');
    client.shutdown();
});






module.exports.store = store;
module.exports.client = client;
