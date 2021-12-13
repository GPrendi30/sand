const axios = require('axios').default;
require('dotenv').config();

const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);
const lastMidnight = new Date(currentDate.setHours(0, 0, 0, 0));
const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);
const apiKey = process.env.OPENSEA_API;

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
    const endTimestamp = currentTimestamp;
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
    const occuredAfter = currentTimestamp - time
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

module.exports.dailyVolume = dailyVolume;
module.exports.createArrayWithPrices = createArrayWithPrices;
module.exports.getCollectionDataWithAddress = getCollectionDataWithAddress;
module.exports.getCollectionDataWithSlug = getCollectionDataWithSlug;
