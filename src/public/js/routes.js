const axios = require('axios').default;
require('dotenv').config();

/**
 * Function to get the general data of a collection giving a collection slug.
 * @param string slug, the collection slug
 * @returns {object} object with all the data.
 */
function getCollectionData (slug) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/collection/' + slug,
        headers: { Accept: 'application/json', 'X-API-KEY': process.env.OPENSEA_API }
    }
    return Promise.resolve(
        axios.request(options).then(function (response) {
            // console.log(response.data);
            return response.data;
        }).catch(function (error) {
            console.error(error);
        })
    )
}

/**
 * Function to get the sell events occurred between the two timestamps.
 * @param string contractAddress, the contract address of the collection.
 * @param int firstTimestamp, show events listed after this timestamp.
 * @param int secondTimestamp, show events listed before this timestamp.
 * @returns {object} object with all the data.
 */
function getSalesFromTimeToTime (contractAddress, firstTimestamp, secondTimestamp) {
    const options = {
        method: 'GET',
        url: 'https://api.opensea.io/api/v1/events?asset_contract_address=' + contractAddress + '&event_type=successful&only_opensea=false&offset=0&occurred_after=' + firstTimestamp + '&occurred_before=' + secondTimestamp + '&limit=250',
        headers: { Accept: 'application/json', 'X-API-KEY': process.env.OPENSEA_API }
    }

    return Promise.resolve(
        axios.request(options).then(function (response) {
            // console.log(response.data);
            return response.data;
        }).catch(function (error) {
            console.error(error);
        })
    )
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string contractAddress, the contract address of the collection.
 * @param int firstTimestamp, show events listed after this timestamp.
 * @param int secondTimestamp, show events listed before this timestamp.
 * @returns {object} object with data of time and sell price [{ time: 'time', price: 'price'}].
 */
function createArrayWithPrices (contractAddress, firstTimestamp, secondTimestamp) {
    return Promise.resolve(
        getSalesFromTimeToTime(contractAddress, firstTimestamp, secondTimestamp)
            .then(res => {
                const data = [];
                res.asset_events.forEach(el => {
                    data.push({
                        timestamp: el.transaction.timestamp,
                        price: (el.total_price / 1000000000000000000)
                    });
                })
                // console.log(data);
                return data;
            })
    );
}
