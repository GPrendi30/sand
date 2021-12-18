const axios = require('axios').default;
require('dotenv').config();
const eventBus = require('./eventBus');
const redis = require('./redis').client;

const apiKey = process.env.OPENSEA_API;

// const object = {
//     name: 'enrico',
//     surname: 'di pietro'
// }

// redis.set('obj', object, function (err, reply) {
//     console.log(err);
//     console.log(reply);
// });

// const obj = redis.get('obj',
//     function (err, reply) {
//         console.log(err);
//         console.log(reply);
//     });

// console.log('obj.name', obj.name)
// console.log('obj.surname', obj.surname)

// redis.hmset('slug', 'surrrname', 'enrico', 'surname', 'dipiee', function (err, reply) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(reply);
//     }
// });

// redis.hget('fewrfmjewfjm', 'surname', function (err, reply) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(reply);
//     }
// });
// if not in the cache response is null
// redis.hget('shish', 'shishsh').then(res => { console.log(res) })

// collectionData = {
//     title: data.collection.name,
//     slug: slug,
//     img: data.collection.image_url,
//     banner_img: data.collection.banner_image_url,
//     OpenSea_link: 'https://opensea.io/collection/' + slug,
//     total_volume: data.collection.stats.total_volume,
//     num_owners: data.collection.stats.num_owners,
//     num_assets: data.collection.stats.count
// }

/**
 * Function to get the general data of a collection passing as parameter a collection slug.
 * @param string slug, the collection slug
 * @returns {object} object with all the data.
 */
async function getCollectionDataWithSlug (slug) {
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
async function getCollectionDataWithAddress (address) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/asset_contract/' + address,
        headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
    }

    let response;
    try {
        response = await axios.request(options);
    } catch (error) { console.error(error); }

    // getCollectionDataWithSlug(response.data.collection.slug).then(result => { console.log(result) });
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
 * Function to get the number of sell events occurred between the two timestamps.
 * @param string contractAddress, the contract address of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object with data representing the daily volume.
 */
async function dailySales (contractAddress, timeInDays) {
    const dailySalesArray = [];
    const lastMidnight = new Date(new Date().setHours(0, 0, 0, 0));
    const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

    for (let i = timeInDays; i > 0; --i) {
        const startTimestamp = lastMidnightTimestamp - 86400 * i;
        const endTimestamp = lastMidnightTimestamp - 86400 * (i - 1);
        try {
            const response =  await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
            dailySalesArray.push(response.asset_events.length);
        } catch (error) { console.error(error); }
    }

    // adding today's sales separately because it's a shorter amount of time (from last midnight to now)
    const startTimestamp = lastMidnightTimestamp;
    const endTimestamp = Math.trunc(Date.now() / 1000);
    try {
        const response =  await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
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
async function createArrayWithPrices (contractAddress, startTimestamp, endTimestamp) {
    const data = [];
    let res;
    try {
        res = await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
        res.asset_events.forEach(el => {
            // let date = new Date(el.transaction.timestamp);
            // date = Math.floor(date / 1000);
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
 * @param string contractAddress, the contract address of the collection.
 * @param string tokenID, the ID of the token in the collection.
 * @returns {object} object with data of the specific token.
 */
async function pullTokenDataByID (contractAddress, tokenID) {
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
async function dailyVolume (contractAddress, timeInDays) {
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
            response =  await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
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
        const response =  await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
        response.asset_events.forEach(el => {
            todayVolume += (el.total_price / 1000000000000000000);
        })
        dailyVolumeArray.push(todayVolume);
    } catch (error) { console.error(error); }

    return dailyVolumeArray;
}

/**
 * Function to get the collection of a user by passing a wallet address.
 * @param string walletAddress, the collection wallet address.
 * @returns {object} object with all the data.
 */
async function getCollectionsOfWallet (walletAddress) {
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
async function getWalletTokenValues (walletAddress) {
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
function returnDifference (oldSet, newSet) {
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
function getChanges (walletAddress, time) {
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
async function trackWallet (walletAddress, time) {
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
async function prettyTrackingSales (walletAddress, time) {
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

async function getAllEventsSince (time, offset = 0) {
    const timestmp = Math.trunc(Date.now() / 1000)
    const occuredAfter = timestmp - time
    // console.log(timestmp, occuredAfter)
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
    } catch (error) { console.error(error); }

    const events = []

    response.data.asset_events.forEach(data => {
        const event = {
            metadata: {
                event: data.event_type,
                price: data.total_price / 1000000000000000000,
                currency: 'ETH',
                seller: data.seller.address,
                buyer: data.winner_account.address
            },
            asset: {
                name: data.asset.name,
                id: data.asset.token_id,
                collection: data.asset.collection.name,
                address: data.asset.asset_contract.address,
                slug: data.asset.collection.slug,
                link: data.asset.permalink
            }
        }
        events.push(event)
    })

    return events
}

function startTracking () {
    setInterval(async () => {
        console.log('Monitoring')
        const events = await getAllEventsSince(15)

        eventBus.emit('tracking_update', events);
    }, 10000) // 10s
}

/**
 * Get a list with 300 random collections.
 * @returns {object} object with all the data.
 */
async function getCollections () {
    // Returns a random integer from 1 to 100:
    const offset = Math.floor(Math.random() * 49700);
    console.log(offset);
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collections',
        params: { offset: offset, limit: '1' }
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
            slug: collection.slug,
            img: image,
            banner_img: collection.banner_image_url,
            link: '/discover/' + collection.slug,
            OpenSea_link: 'https://opensea.io/collection/' + collection.slug,
            total_volume: collection.stats.total_volume,
            num_owners: collection.stats.num_owners,
            num_assets: collection.stats.count

        }

        console.log(collection.slug)

        // redis.hmset('get_' + collection.slug,
        //     'title', collectionsData.title,
        //     'slug', collectionsData.slug,
        //     'img', collectionsData.img,
        //     'banner_img', collectionsData.banner_img,
        //     'link', collectionsData.link,
        //     'OpenSea_link', collectionsData.OpenSea_link,
        //     'total_volume', collectionsData.total_volume,
        //     'num_owners', collectionsData.num_owners,
        //     'num_assets', collectionsData.num_assets,
        //     function (err, reply) {
        //         if (err) {
        //             console.log(err);
        //         } else {
        //             console.log(reply);
        //         }
        //     }
        // );

        // collectionData = {
        //     title: data.collection.name,
        //     slug: slug,
        //     img: data.collection.image_url,
        //     banner_img: data.collection.banner_image_url,
        //     OpenSea_link: 'https://opensea.io/collection/' + slug,
        //     total_volume: data.collection.stats.total_volume,
        //     num_owners: data.collection.stats.num_owners,
        //     num_assets: data.collection.stats.count
        // }

        allCollectionsData.push(collectionsData)
    })

    console.log(allCollectionsData)
    return allCollectionsData
}

module.exports.dailySales = dailySales;
module.exports.dailyVolume = dailyVolume;
module.exports.createArrayWithPrices = createArrayWithPrices;
module.exports.getCollectionDataWithAddress = getCollectionDataWithAddress;
module.exports.getCollectionDataWithSlug = getCollectionDataWithSlug;
module.exports.startTracking = startTracking;
module.exports.getCollections = getCollections;

getCollections()

// redis.hget('get_', 'surname', function (err, reply) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(reply);
//     }
// });
