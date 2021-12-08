const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || 'localhost';

const opts = {
    host: redisHost,
    port: redisPort,
    // password: process.env.REDIS_PASSWORD || '',
    legacyMode: true,
    connectTimeout: 3000,
    // maxRetriesPerRequest: 0,
    retryStrategy: function (times) {
        if (times > 3) {
            console.log('redisRetryError', 'Redis reconnect exhausted after 3 retries.');
            return null;
        }

        return 200;
    }
};

let client;
let store;

try {
    client = new Redis(opts);

    store = new RedisStore({ client: client });
} catch (err) {
    console.log('Redis connection failed');
    console.log('redisError:', err);
} finally {
    client.disconnect();
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
