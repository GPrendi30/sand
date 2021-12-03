const axios = require('axios').default;
require('dotenv').config();

const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);
const apiKey = process.env.OPENSEA_API;

/**
 * Function to get the general data of a collection giving a collection slug.
 * @param string slug, the collection slug
 * @returns {object} object with all the data.
 */
async function getCollectionData (slug) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collection/' + slug,
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
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string contractAddress, the contract address of the collection.
 * @param int startTimestamp, show events listed after this timestamp.
 * @param int endTimestamp, show events listed before this timestamp.
 * @returns {object} object with data of time and sell price [{ time: 'time', price: 'price'}].
 */
async function createArrayWithPrices (contractAddress, startTimestamp, endTimestamp) {
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

    for (let i = timeInDays; i > 0; --i) {
        let response;
        let volume = 0;
        const startTimestamp = currentTimestamp - 86400 * i;
        const endTimestamp = currentTimestamp - 86400 * (i - 1);
        try {
            response =  await getSalesFromStartToEnd(contractAddress, startTimestamp, endTimestamp)
            response.asset_events.forEach(el => {
                volume += (el.total_price / 1000000000000000000);
            })
            dailyVolumeArray.push(volume);
        } catch (error) { console.error(error); }
    }

    return dailyVolumeArray;
}