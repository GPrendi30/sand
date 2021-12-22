const axios = require('axios').default;
require('dotenv').config();
const eventBus = require('./eventBus');
const redis = require('./redis').client;

// the API Key to get the data from OpenSea
const apiKey = process.env.OPENSEA_API;

/**
 * Function to get the general data of a collection passing as parameter a collection slug.
 * @param string slug, the collection slug
 * @returns {object} object with all the data.
 */
async function getCollectionDataWithSlug(slug) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collection/' + slug,
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    try {
        response = await axios.request(options);

        return response.data;
    } catch (error) { console.error(error); }
}

/**
 * Function to get the general data of a collection passing as parameter a collection address.
 * @param string the collection address
 * @returns {object} object with all the data.
 */
async function getCollectionDataWithAddress(address) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/asset_contract/' + address,
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    return response.data;
}

/**
 * Function to get the sell events occurred between the two timestamps.
 * @param string contractAddress, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @param int endTimestamp, show events listed before this timestamp.
 * @returns {object} object with all the data.
 */
async function getSalesFromStartToEnd (contractAddress, startTimestamp, endTimestamp) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/events?asset_contract_address=' + contractAddress + '&event_type=successful&only_opensea=false&offset=0&occurred_after=' + startTimestamp + '&occurred_before=' + endTimestamp + '&limit=300',
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    return response.data;
}

/**
 * Function to get the sell events occurred between the two timestamps with collection slug.
 * @param string collectionSlug, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @param int endTimestamp, show events listed before this timestamp.
 * @returns {object} object with all the data.
 */
async function getSalesFromStartToEndWithCollectionSlug (collectionSlug, startTimestamp, endTimestamp) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/events?collection_slug=' + collectionSlug + '&event_type=successful&only_opensea=false&offset=0&occurred_after=' + startTimestamp + '&occurred_before=' + endTimestamp + '&limit=300',
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    return response.data;
}

/**
 * Function to get the number of sell events occurred between the two timestamps.
 * @param string collectionSlug, the contract address of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object with data representing the daily volume.
 */
async function dailySales (collectionSlug, timeInDays) {
    const dailySalesArray = [];
    const lastMidnight = new Date(new Date().setHours(0, 0, 0, 0));
    const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

    for (let i = timeInDays; i > 0; --i) {
        const startTimestamp = lastMidnightTimestamp - 86400 * i;
        const endTimestamp = lastMidnightTimestamp - 86400 * (i - 1);
        try {
            const response =  await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
            dailySalesArray.push(response.asset_events.length);
        } catch (error) { console.error(error); }
    }

    // adding today's sales separately because it's a shorter amount of time (from last midnight to now)
    const startTimestamp = lastMidnightTimestamp;
    const endTimestamp = Math.trunc(Date.now() / 1000);
    try {
        const response =  await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
        dailySalesArray.push(response.asset_events.length);
    } catch (error) { console.error(error); }

    return dailySalesArray;
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string contractAddress, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @param int endTimestamp, show events listed before this timestamp.
 * @returns {object} object with data of time and sell price [{ time: 'time', price: 'price'}, ...].
 */
async function createArrayWithPrices(contractAddress, startTimestamp, endTimestamp) {
    const data = [];
    let res;
    try {
        res = await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
        res.asset_events.forEach(el => {
            data.push({
                timestamp: el.transaction.timestamp,
                price: (el.total_price / 1000000000000000000)
            });
        })
    } catch (error) { console.error(error); }

    return data;
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string collectionSlug, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @param int endTimestamp, show events listed before this timestamp.
 * @returns {object} object with data of time and sell price [{ time: 'time', price: 'price'}, ...].
 */
async function createArrayWithPricesFromSlug (collectionSlug, startTimestamp, endTimestamp) {
    const data = [];
    let res;
    try {
        res = await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
        res.asset_events.forEach(el => {
            data.push({
                timestamp: el.transaction.timestamp,
                price: (el.total_price / 1000000000000000000)
            });
        })
    } catch (error) { console.error(error); }

    return data;
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string collectionSlug, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @param int endTimestamp, show events listed before this timestamp.
 * @returns {object} object with data of time and sell price [{ time: 'time', price: 'price'}, ...].
 */
async function createArrayWithPricesForCache (response) {
    const data = [];
    response.asset_events.forEach(el => {
        data.push({
            timestamp: el.transaction.timestamp,
            price: (el.total_price / 1000000000000000000)
        });
    })

    return data;
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string contractAddress, the contract address of the collection.
 * @param string tokenID, the ID of the token in the collection.
 * @returns {object} object with data of the specific token.
 */
async function pullTokenDataByID(contractAddress, tokenID) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/assets?token_ids=' + tokenID +
            '&asset_contract_address=' + contractAddress + '&order_direction=desc&offset=0&limit=30',
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    let token;
    try {
        response = await axios.request(options);
        token = response.data.assets[0];
    } catch (error) { console.error(error); }

    return token;
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string contractAddress, the contract address of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object with data representing the daily volume.
 */
async function dailyVolume(contractAddress, timeInDays) {
    const dailyVolumeArray = [];
    const lastMidnight = new Date(new Date().setHours(0, 0, 0, 0));
    const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

    // adding every needed day's volume getting volume day by day and pushing it into dailyVolumeArray
    for (let i = timeInDays; i > 0; --i) {
        let response;
        let volume = 0;

        const startTimestamp = lastMidnightTimestamp - 86400 * i;
        const endTimestamp = lastMidnightTimestamp - 86400 * (i - 1);
        try {
            response = await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
            response.asset_events.forEach(el => {
                volume += (el.total_price / 1000000000000000000);
            })
            dailyVolumeArray.push(volume);
        } catch (error) { console.error(error); }
    }

    // adding today's volume separately because it's a shorter amount of time (from last midnight to now)
    const startTimestamp = lastMidnightTimestamp;
    const endTimestamp = Math.trunc(Date.now() / 1000);
    try {
        let todayVolume = 0;
        const response = await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
        response.asset_events.forEach(el => {
            todayVolume += (el.total_price / 1000000000000000000);
        })
        dailyVolumeArray.push(todayVolume);
    } catch (error) { console.error(error); }

    return dailyVolumeArray;
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}] from a slug.
 * @param string collectionSlug, the collection slug.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object with data representing the daily volume.
 */
async function dailyVolumeWithSlug (collectionSlug, timeInDays) {
    const dailyVolumeArray = [];
    // create the arrau also for the daily sales scatter chart 
    const lastMidnight = new Date(new Date().setHours(0, 0, 0, 0));
    const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

    for (let i = timeInDays; i > 0; --i) {
        let response;
        let volume = 0;

        const startTimestamp = lastMidnightTimestamp - 86400 * i;
        const endTimestamp = lastMidnightTimestamp - 86400 * (i - 1);
        try {
            response =  await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
            response.asset_events.forEach(el => {
                volume += (el.total_price / 1000000000000000000);
            })
            dailyVolumeArray.push(volume);
        } catch (error) { console.error(error); }
    }

    // adding today's volume separately because it's a shorter amount of time (from last midnight to now)
    const startTimestamp = lastMidnightTimestamp;
    const endTimestamp = Math.trunc(Date.now() / 1000);
    try {
        let todayVolume = 0;
        const response =  await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
        response.asset_events.forEach(el => {
            todayVolume += (el.total_price / 1000000000000000000);
        })
        dailyVolumeArray.push(todayVolume);
    } catch (error) { console.error(error); }

    await storeVolumeArrayInCache(collectionSlug, dailyVolumeArray)
    return dailyVolumeArray;
}

/**
 * Function to get the collection of a user by passing a wallet address.
 * @param string walletAddress, the collection wallet address.
 * @returns {object} object with all the data.
 */
async function getCollectionsOfWallet(walletAddress) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collections',
        params: {
            asset_owner: walletAddress,
            offset: '0',
            limit: '300'
        }
    }

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    return response;
}

/**
 * Function to get the collection of a user by passing a wallet address.
 * @param string walletAddress, the collection wallet address.
 * @returns {object} object with all the data.
 */
async function getWalletTokenValues(walletAddress) {
    let response;
    const record = {};
    try {
        response = await getCollectionsOfWallet(walletAddress);
        response.data.forEach(token => {
            const key = token.slug;
            const count = token.owned_asset_count;
            record[key] = count;
        })
    } catch (error) { console.error(error); }

    return record;
}

/**
 * Function to check the difference between two objects and return what was added.
 * @param {object} oldSet, object containing the old data.
 * @param {object} newSet, object containing the new data .
 * @returns {object} object with the difference between the two objects.
 */
function returnDifference(oldSet, newSet) {
    const newTokens = {};
    // check the token that have been added to the new set
    for (const [key, value] of Object.entries(newSet)) {
        if (key in oldSet) {
            if (oldSet[key] !== newSet[key]) {
                newTokens[key] = newSet[key] - oldSet[key];
            }
        } else {
            newTokens[key] = newSet[key];
        }
    }
    // check the token that have been removed from the old set
    for (const [key, value] of Object.entries(oldSet)) {
        if (!(key in newSet)) {
            newTokens[key] = -1 * (oldSet[key]);
        }
    }

    return newTokens;
}

/**
 * Function to check the difference between two objects and return what was added.
 * @param string walletAddress, the address that we want to track.
 * @param string time, .
 * @returns {object} object with the difference between the two objects.
 */
function getChanges(walletAddress, time) {
    getWalletTokenValues(walletAddress).then(firstSet => {
        setTimeout(() => {
            getWalletTokenValues(walletAddress).then(secondSet => {
                returnDifference(firstSet, secondSet);
            })
        }, time);
    })
}

/**
 * Function to get all the events happened to a wallet in the desired time.
 * @param string walletAddress, the address that we want to track.
 * @param string time, time in seconds.
 * @returns {object} object with all the events.
 */
async function trackWallet(walletAddress, time) {
    const timestmp = Math.trunc(Date.now() / 1000)
    const occuredAfter = timestmp - time
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/events',
        params: {
            account_address: walletAddress,
            only_opensea: 'false',
            offset: '0',
            limit: '300',
            occurred_after: occuredAfter
        },
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    return response.data.asset_events;
}

/**
 * Function to get all the events happened to a wallet in the desired time.
 * @param string walletAddress, the address that we want to track.
 * @param string time, time in seconds.
 * @returns {object} object with the events happened to the wallet on that time, positive values means bought something and viceversa.
 */
async function prettyTrackingSales(walletAddress, time) {
    const changedTokens = {};

    try {
        const set = await trackWallet(walletAddress, time)
        set.forEach(event => {
            if (event.event_type === 'successful') {
                if (event.collection_slug in changedTokens && event.seller.address.toLowerCase() === walletAddress.toLowerCase()) {
                    changedTokens[event.collection_slug]--
                } else if (event.collection_slug in changedTokens && event.seller.address.toLowerCase() !== walletAddress.toLowerCase()) {
                    changedTokens[event.collection_slug]++
                } else if (!(event.collection_slug in changedTokens) && event.seller.address.toLowerCase() === walletAddress.toLowerCase()) {
                    changedTokens[event.collection_slug] = -1
                } else if (!(event.collection_slug in changedTokens) && event.seller.address.toLowerCase() !== walletAddress.toLowerCase()) {
                    changedTokens[event.collection_slug] = 1
                }
            }
        })
    } catch (error) { console.error(error); }

    // positive values means that the tracked address bought the asset
    return changedTokens;
}


/**
 * Function to get the sell events occurred after a timestamp timestamps.
 * @param int time, the time after which the required events occured.
 * @param int offset, the offset with which the data should be get.
 * @returns {object} object with all the events.
 */
async function getAllEventsSince(time, offset = 0) {
    const timestmp = Math.trunc(Date.now() / 1000)
    const occuredAfter = timestmp - time
    // limit represent the limit of the event that we can get in a single API request
    const limit = 300;
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/events',
        params: { only_opensea: 'false', offset: offset, limit: limit, occurred_after: occuredAfter, event_type: 'successful' },
        headers: { Accept: 'application/json', 'X-API-KEY': 'ca17564f13624bdcb6e5c721174e4a9e' }
    };

    let response;
    try {
        response = await axios.request(options);
    } catch (error) {
        console.error('API throttled');
    }

    const events = []
    if (response && response.data) {
        response.data.asset_events.forEach(data => {
            const event = {}
            if (data.asset) {
                const asset = {
                    name: data.asset.name,
                    id: data.asset.token_id,
                    collection: data.asset.collection.name,
                    address: data.asset.asset_contract.address,
                    slug: data.asset.collection.slug,
                    link: data.asset.permalink
                }
                event.asset = asset;
            }
            if (data.seller && data.winner_account) {
                event.metadata = {
                    event: data.event_type,
                    price: data.total_price / 1000000000000000000,
                    currency: 'ETH',
                    seller: data.seller.address,
                    buyer: data.winner_account.address
                }
            }

            events.push(event)
        })
    }

    return events
}

function startTracking() {
    setInterval(async () => {
        // console.log('Monitoring')
        const events = await getAllEventsSince(15)
        if (events.length > 0) {
            eventBus.emit('tracking_update', events);
        }
    }, 10000) // 10s
}

/**
 * Get a list with 300 random collections.
 * @returns {object} object with 300 random collections data.
 */
async function getCollections () {
    // Returns a random integer from 1 to 100:
    const offset = Math.floor(Math.random() * 49700);
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collections',
        params: { offset: offset, limit: '300' }
    };

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    const allCollectionsData = []
    response.data.collections.forEach(collection => {
        let image = ''

        if (collection.image_url === null) {
            image = '/images/image_not_available.png'
        } else {
            image = collection.image_url
        }
        const collectionsData = {
            title: collection.name,
            description: collection.description,
            slug: collection.slug,
            img: image,
            banner_img: collection.banner_image_url,
            link: '/discover/' + collection.slug,
            OpenSea_link: 'https://opensea.io/collection/' + collection.slug,
            total_volume: collection.stats.total_volume,
            num_owners: collection.stats.num_owners,
            num_assets: collection.stats.count,
            average_price: collection.stats.average_price,
            floor_price: collection.stats.floor_price,
            created_date: collection.created_date,
            total_sales: collection.stats.total_sales
        }

        redis.hmset('get_' + collection.slug,
            'title', collectionsData.title,
            'description', collectionsData.description,
            'slug', collectionsData.slug,
            'img', collectionsData.img,
            'banner_img', collectionsData.banner_img,
            'link', collectionsData.link,
            'OpenSea_link', collectionsData.OpenSea_link,
            'total_volume', collectionsData.total_volume,
            'num_owners', collectionsData.num_owners,
            'num_assets', collectionsData.num_assets,
            'average_price', collectionsData.average_price,
            'floor_price', collectionsData.floor_price,
            'created_date', collectionsData.created_date,
            'total_sales', collectionsData.total_sales,
            function (err, reply) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Collection ' + collection.slug + ' was added to cache');
                }
            }
        );

        allCollectionsData.push(collectionsData)
    })

    return allCollectionsData
}

/**
 * Get a list with all the collections owned by an address.
 * @returns {object} object with all the data of the collections.
 * @issue currently fetches only the first 300 collections. Implement iteratively with offset to solve this issue.
 */
async function getCollectionsWithOwnerAddress () {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collections',
        params: { asset_owner: '0x28C7400877F6d012B79a6b85297204A73D388335', offset: 0, limit: '300' },
        headers: { 'X-API-KEY': apiKey }
    };

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    const allCollectionsData = []
    response.data.forEach(collection => {
        let image = ''

        if (collection.image_url === null) {
            image = '/images/image_not_available.png'
        } else {
            image = collection.image_url
        }
        const collectionsData = {
            title: collection.name,
            description: collection.description,
            slug: collection.slug,
            img: image,
            banner_img: collection.banner_image_url,
            link: '/discover/' + collection.slug,
            OpenSea_link: 'https://opensea.io/collection/' + collection.slug,
            total_volume: collection.stats.total_volume,
            num_owners: collection.stats.num_owners,
            num_assets: collection.stats.count,
            average_price: collection.stats.average_price,
            floor_price: collection.stats.floor_price,
            created_date: collection.created_date,
            total_sales: collection.stats.total_sales
        }

        redis.hmset('get_' + collection.slug,
            'title', collectionsData.title,
            'description', collectionsData.description,
            'slug', collectionsData.slug,
            'img', collectionsData.img,
            'banner_img', collectionsData.banner_img,
            'link', collectionsData.link,
            'OpenSea_link', collectionsData.OpenSea_link,
            'total_volume', collectionsData.total_volume,
            'num_owners', collectionsData.num_owners,
            'num_assets', collectionsData.num_assets,
            'average_price', collectionsData.average_price,
            'floor_price', collectionsData.floor_price,
            'created_date', collectionsData.created_date,
            'total_sales', collectionsData.total_sales,
            function (err, reply) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Collection ' + collection.slug + ' was added to cache');
                }
            }
        );

        allCollectionsData.push(collectionsData)
    })

    return allCollectionsData
}

/**
 * Save the data of a collection in the cache.
 * @param collectionSlug the slug of the collection.
 */
async function setInCache (collectionSlug) {
    const data = await getCollectionDataWithSlug(collectionSlug)

    redis.hmset('get_' + data.collection.slug,
        'title', data.collection.name,
        'description', data.collection.description,
        'slug', data.collection.slug,
        'img', data.collection.image_url,
        'banner_img', data.collection.banner_image_url,
        'link', '/discover/' + data.collection.slug,
        'OpenSea_link', 'https://opensea.io/collection/' + data.collection.slug,
        'total_volume', data.collection.stats.total_volume,
        'num_owners', data.collection.stats.num_owners,
        'num_assets', data.collection.stats.count,
        'average_price', data.collection.stats.average_price,
        'floor_price', data.collection.stats.floor_price,
        'created_date', data.collection.created_date,
        'total_sales', data.collection.stats.total_sales,
        function (err, reply) {
            if (err) {
                console.log(err);
            } else {
                console.log('Collection ' + data.collection.slug + ' was added to cache');
            }
        }
    )
}

/**
 * Check if the data of a collection exists is stored the cache. If it isn't stored, it's created.
 * This method stores the general data and it can be found in the cache with 'get_collectionSlug'.
 * @param collectionSlug the slug of the collection.
 */
async function checkInCache (collectionSlug) {
    const inCache = await redis.hget('get_' + collectionSlug, 'title')
    if (inCache === null) {
        setInCache(collectionSlug)
    }

    const getSlug = 'get_' + collectionSlug
    const title = await redis.hget(getSlug, 'title')
    const description = await redis.hget(getSlug, 'description')
    const slug = await redis.hget(getSlug, 'slug')
    const img = await redis.hget(getSlug, 'img')
    const bannerImg = await redis.hget(getSlug, 'banner_img')
    const link = await redis.hget(getSlug, 'link')
    const OpenSeaLink = await redis.hget(getSlug, 'OpenSea_link')
    const totalVolume = await redis.hget(getSlug, 'total_volume')
    const numOwners = await redis.hget(getSlug, 'num_owners')
    const numAssets = await redis.hget(getSlug, 'num_assets')
    const averagePrice = await redis.hget(getSlug, 'average_price')
    const floorPrice = await redis.hget(getSlug, 'floor_price')
    const createdDate = await redis.hget(getSlug, 'created_date')
    const totalSales = await redis.hget(getSlug, 'total_sales')

    const data = {
        title: title,
        description: description,
        slug: slug,
        img: img,
        banner_img: bannerImg,
        link: link,
        OpenSea_link: OpenSeaLink,
        total_volume: totalVolume,
        num_owners: numOwners,
        num_assets: numAssets,
        average_price: averagePrice,
        floor_price: floorPrice,
        created_date: createdDate,
        total_sales: totalSales
    }

    return data
}

/**
 * Stores the volume of a collection in the cache.
 * This method stores the volume data and it can be found in the cache with 'vol_collectionSlug'.
 * @param collectionSlug the slug of the collection.
 */
async function storeVolumeArrayInCache (collectionSlug, volumeArrayOriginal) {

    // remove last element from array -> today's volume is not complete
    const volumeArray = JSON.parse(JSON.stringify(volumeArrayOriginal));
    volumeArray.pop()

    const volumeObject = {
        // last midnight date
        latest: new Date(new Date().setHours(0, 0, 0, 0)),
        data: volumeArray
    }

    const stringifiedObject = JSON.stringify(volumeObject) // JSON.parse(..) to go back

    const dataInCache = JSON.parse(await redis.get('vol_' + collectionSlug))
    if (dataInCache === null) { // no data in cache
        await redis.set('vol_' + collectionSlug, stringifiedObject)
    } else {
        // keep the data in cache
        const elapsedDays = Math.trunc(((new Date(volumeObject.latest) - new Date(dataInCache.latest)) / 1000) / 86400)
        if (elapsedDays === 0) {
            if (volumeObject.data.length > dataInCache.data.length) {
                await redis.set('vol_' + collectionSlug, stringifiedObject)
            }
        } else if (elapsedDays > 30) {
            await redis.set('vol_' + collectionSlug, stringifiedObject)
        } else if (elapsedDays > 0) {
            if (volumeObject.data.length < elapsedDays) {
                await redis.set('vol_' + collectionSlug, stringifiedObject)
            } else if (volumeObject.data.length === elapsedDays && volumeObject.data.length < 30) {
                // concatenate days (max 30) and push
                const len = volumeObject.data.length
                if (30 - len > dataInCache.data.length) {
                    const newData = dataInCache.data.concat(volumeObject.data)
                    volumeObject.data = newData
                    await redis.set('vol_' + collectionSlug, JSON.stringify(volumeObject))
                } else if (30 - len < dataInCache.data.length) {
                    // slice + concatenate + push
                    const cacheArray = dataInCache.data.slice(len - (30 - len), len)
                    const newData = cacheArray.concat(volumeObject.data)
                    volumeObject.data = newData
                    await redis.set('vol_' + collectionSlug, JSON.stringify(volumeObject))
                }
            } else if (volumeObject.data.length > elapsedDays) {
                // discard overlap
                const len = volumeObject.data.length
                const dataArray = volumeObject.data.slice(len - elapsedDays, len)
                // concatenate days (max 30) and push
                if (len + dataInCache.data.length < 30) {
                    const cacheArray = dataInCache.volume.slice(len - (30 - len), len)
                    const newData = cacheArray.concat(dataArray)
                    volumeObject.data = newData
                    await redis.set('vol_' + collectionSlug, JSON.stringify(volumeObject))
                } else {
                    const cacheArray = dataInCache.data.slice(len - (30 - len), len)
                    const newData = cacheArray.concat(dataArray)
                    volumeObject.data = newData
                    await redis.set('vol_' + collectionSlug, JSON.stringify(volumeObject))
                }
            } else {
                console.log('Error: cannot store in the cache')
            }
        }
    }
}

/**
 * Get the volume of a collection of the required days from the cache.
 * @param collectionSlug the slug of the collection.
 * @param days the number of days to get from the cache.
 */
async function getVolumeFromCache (collectionSlug, days) {
    // let dailyVolumeArray
    const volumeObject = JSON.parse(await redis.get('vol_' + collectionSlug))
    if (volumeObject !== null) {
        const elapsedDays = Math.trunc(((new Date() - new Date(volumeObject.latest)) / 1000) / 86400)

        let volumeArrayFromCache = []
        const numbOfDaysInCache = days - elapsedDays

        if (numbOfDaysInCache > 0) {
            const len = volumeObject.data.length
            volumeArrayFromCache = volumeObject.data.slice(len - numbOfDaysInCache, len)
        }

        const requiredDays = days - numbOfDaysInCache
        const fetchedVolume = await dailyVolumeWithSlug(collectionSlug, requiredDays)
        return volumeArrayFromCache.concat(fetchedVolume)
    } else {
        const dailyVolumeArray = dailyVolumeWithSlug(collectionSlug, days)
        return dailyVolumeArray
    }
}

/**
 * Get the all the sell events of a collection in the required days from the cache.
 * @param collectionSlug the slug of the collection.
 * @param timeStamp the timestamp after which the event happened.
 */
async function getSalesFromCache (collectionSlug, timeStamp) {
    // const dayCopy = parseInt(days) + 1
    const salesArray = JSON.parse(await redis.get('sales_' + collectionSlug))

    if (salesArray !== null) {
        const oldestCacheTimestamp = Math.trunc(new Date(salesArray[0].t).getTime() / 1000)
        // const newestCacheTimestamp = Math.trunc(new Date(salesArray[salesArray.length - 1].t).getTime() / 1000) --> wrong
        const oldestSearchedValue = timeStamp


        const newSalesArray = []

        if (oldestCacheTimestamp < oldestSearchedValue) { // && oldestSearchedValue < newestCacheTimestamp) {
            let i = 0
            while (i < salesArray.length - 1 && (new Date(salesArray[i].t)).getTime() < (new Date(oldestSearchedValue * 1000)).getTime()) {
                ++i
            }
            for (let j = i; j < salesArray.length; ++j) { newSalesArray.push(salesArray[j]) }

            const afterCache = (await getAllSalesFromStart(collectionSlug, new Date(salesArray[salesArray.length - 1].t + '.069Z')))

            newSalesArray.concat(afterCache)

            const toStore = salesArray.concat(afterCache)
            await redis.set('sales_' + collectionSlug, JSON.stringify(toStore))
            return newSalesArray
        } else if (oldestSearchedValue < oldestCacheTimestamp) {
            const newSalesArray = await getAllSalesFromStart(collectionSlug, timeStamp - 86400)
            // store in cache newSalesArray
            await redis.set('sales_' + collectionSlug, JSON.stringify(newSalesArray))
            return newSalesArray
        }
    } else {
        const newSalesArray = await getAllSalesFromStart(collectionSlug, timeStamp - 86400)
        // store in cache newSalesArray
        await redis.set('sales_' + collectionSlug, JSON.stringify(newSalesArray))
        return newSalesArray
    }
}

/**
 * Function to get the sell events occurred from a timestamp to now with collection slug.
 * @param string collectionSlug, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @returns {object} object with all the data.
 */
 async function getAllSalesFromStart (collectionSlug, startTimestamp) {
    let offset = 0
    const limit = 300
    const salesArray = []

    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/events',
        params: {
            collection_slug: collectionSlug,
            event_type: 'successful',
            only_opensea: 'false',
            offset: offset,
            limit: limit,
            //   occurred_before: endTimestamp,
            occurred_after: startTimestamp
        },
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    try {
        const divide = 1000000000000000000
        let response = await axios.request(options);

        while (response.data.asset_events.length > 0) {
            response.data.asset_events.forEach(el => {
                salesArray.push({
                    t: el.transaction.timestamp,
                    p: (el.total_price / divide)
                })
            })
            offset += 300
            options.params.offset = offset
            response = await axios.request(options)
        }
    } catch (error) { console.error(error); }

    return salesArray.reverse();
}

/**
 * Function to get the number of daily sell events occurred from a timestamp to now with collection slug.
 * @param string collectionSlug the contract address of the collection.
 * @param int timeInDays the time in days to get the days.
 * @returns {object} object with all the data.
 */
async function dailySalesWithSlug (collectionSlug, timeInDays) {
    const dailySalesArray = [];
    const lastMidnight = new Date(new Date().setHours(0, 0, 0, 0));
    const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

    // adding every needed day's volume getting volume day by day and pushing it into dailyVolumeArray
    for (let i = timeInDays; i > 0; --i) {
        let response;

        const startTimestamp = lastMidnightTimestamp - 86400 * i;
        const endTimestamp = lastMidnightTimestamp - 86400 * (i - 1);
        try {
            response =  await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
            const dailySalesScatter = (await createArrayWithPricesForCache(response)).reverse()
            dailySalesScatter.forEach(el => { dailySalesArray.push(el) })
        } catch (error) { console.error(error); }
    }

    // adding today's volume separately because it's a shorter amount of time (from last midnight to now)
    const startTimestamp = lastMidnightTimestamp;
    const endTimestamp = Math.trunc(Date.now() / 1000);
    try {
        const response =  await getSalesFromStartToEndWithCollectionSlug(collectionSlug, startTimestamp, endTimestamp)
        const dailySalesScatter = (await createArrayWithPricesForCache(response)).reverse()
        dailySalesScatter.forEach(el => { dailySalesArray.push(el) })
    } catch (error) { console.error(error); }

    return dailySalesArray;
}

/**
 * Method to plot the daily volume in the specified days for a specific collection.
 * @param string collectionSlug the contract address of the collection.
 * @param int days the time in days to get the data.
 * @returns {object} object with all the data.
 */
async function plotVolumeBarData (collectionSlug, days) {
    const oldestMidnight = Math.trunc(new Date().setHours(0, 0, 0, 0) / 1000) - 86400 * days
    const salesArray = await getSalesFromCache(collectionSlug, oldestMidnight)
    const dailyVolume = []
    let saleSum = 0
    for (let i = 0; i < salesArray.length - 1; i++) {
        const currentDay = new Date(salesArray[i].t).getDate()

        while (i < salesArray.length && currentDay === new Date(salesArray[i].t).getDate()) {
            saleSum += parseFloat(salesArray[i].p)
            i++
        }
        i--
        dailyVolume.push(saleSum)
        saleSum = 0
    }

    return dailyVolume
}

/**
 * Method to plot the daily sell event occured in the specified days for a specific collection.
 * @param string collectionSlug the contract address of the collection.
 * @param int days the time in days to get the data.
 * @returns {object} object with all the data.
 */
async function plotVolumeNumSalesData (collectionSlug, days) {
    const oldestMidnight = Math.trunc(new Date().setHours(0, 0, 0, 0) / 1000) - 86400 * days
    const salesArray = await getSalesFromCache(collectionSlug, oldestMidnight)
    const dailyVolume = []
    let saleSum = 0
    for (let i = 0; i < salesArray.length - 1; i++) {
        const currentDay = new Date(salesArray[i].t).getDate()

        while (i < salesArray.length && currentDay === new Date(salesArray[i].t).getDate()) {
            saleSum++
            i++
        }
        i--
        dailyVolume.push(saleSum)
        saleSum = 0
    }

    return dailyVolume
}

/**
 * Method to plot the average sell price of the specified days for a specific collection.
 * @param string collectionSlug the contract address of the collection.
 * @param int days the time in days to get the data.
 * @returns {object} object with all the data.
 */
async function plotAveragePriceData (collectionSlug, days) {
    const oldestMidnight = Math.trunc(new Date().setHours(0, 0, 0, 0) / 1000) - 86400 * days
    const salesArray = await getSalesFromCache(collectionSlug, oldestMidnight)
    const dailyVolume = []
    let sum = 0
    let saleSum = 0
    for (let i = 0; i < salesArray.length - 1; i++) {
        const currentDay = new Date(salesArray[i].t).getDate()

        while (i < salesArray.length && currentDay === new Date(salesArray[i].t).getDate()) {
            saleSum += parseFloat(salesArray[i].p)
            sum++
            i++
        }
        i--

        dailyVolume.push(saleSum / sum)

        saleSum = 0
        sum = 0
    }

    return dailyVolume
}

// required exports
module.exports.dailySales = dailySales;
module.exports.dailyVolume = dailyVolume;
module.exports.createArrayWithPrices = createArrayWithPrices;
module.exports.getCollectionDataWithAddress = getCollectionDataWithAddress;
module.exports.getCollectionDataWithSlug = getCollectionDataWithSlug;
module.exports.startTracking = startTracking;
module.exports.getCollections = getCollections;
module.exports.checkInCache = checkInCache;
module.exports.getVolumeFromCache = getVolumeFromCache;
module.exports.createArrayWithPricesFromSlug = createArrayWithPricesFromSlug;
module.exports.getAllSalesFromStart = getAllSalesFromStart
module.exports.getSalesFromCache = getSalesFromCache
module.exports.plotVolumeBarData = plotVolumeBarData
module.exports.plotVolumeNumSalesData = plotVolumeNumSalesData
module.exports.plotAveragePriceData = plotAveragePriceData
module.exports.getCollectionsWithOwnerAddress = getCollectionsWithOwnerAddress