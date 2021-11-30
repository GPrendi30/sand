const sdk = require('api')('@opensea/v1.0#45bdz26kvmh8fbf')
const currentDate = new Date()
const currentTimestamp = currentDate.getTime()

/**
 * Function to get the general data of a collection giving a collection slug.
 * @param string slug, the collection slug
 * @returns {object} object with all the data.
 */
function getDataFromOS (slug) {
  sdk['retrieving-a-single-collection']({
    collection_slug: slug,
    'X-API-KEY': process.env.OPENSEA_API
  })
    .then(collectionData => { console.log(collectionData) })
    .catch(err => {
      console.log('ERROR')
      console.error(err)
    })
}

/**
 * Function to get the sell events occurred between the two timestamps.
 * @param string contractAddress, the contract address of the collection.
 * @param int firstTimestamp, show events listed after this timestamp.
 * @param int secondTimestamp, show events listed before this timestamp.
 * @returns {object} object with all the data.
 */
function getSalesFromToTime (contractAddress, firstTimestamp, secondTimestamp) {
  sdk['retrieving-asset-events']({
    asset_contract_address: contractAddress,
    event_type: 'successful',
    only_opensea: 'false',
    offset: '0',
    limit: '20',
    occurred_after: firstTimestamp, // show events that happened after this timestamp
    occured_before: secondTimestamp,
    'X-API-KEY': process.env.OPENSEA_API
  })
    .then(res => { console.log(res) })
    .catch(err => {
      console.log('ERROR')
      console.error(err)
    })
}