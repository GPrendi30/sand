const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);

const config = require('config').get('cache')
const redisPort = parseInt(config.port)
const redisHost = config.host
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
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
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

let store;

/**
 * Redis client for session storage
 * Currently supports local REDIS
 */
const client = new Redis(opts);
store = new RedisStore({ client: client });


// pinging the client
client.info()
    .catch(() => {
        console.log('Redis connection failed');
        client.disconnect();
        store = null;
    });

client.on('connect', function () {
    console.log('Redis client connected');
});

client.on('error', function () {
    console.log('Redis client error');
    client.disconnect();
});


module.exports = { client, store };
