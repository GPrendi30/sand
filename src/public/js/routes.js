/**
 * Function to get the general data of a collection giving a collection slug.
 * @param string slug, the collection slug
 * @returns {object} object with all the data.
 */
function getCollectionData (slug) {
    // to be implemented
}

/**
 * Function to get the sell events occurred between the two timestamps.
 * @param string contractAddress, the contract address of the collection.
 * @param int firstTimestamp, show events listed after this timestamp.
 * @param int secondTimestamp, show events listed before this timestamp.
 * @returns {object} object with all the data.
 */
function getSalesFromTimeToTime (contractAddress, firstTimestamp, secondTimestamp) {
    // to be implemented
}

/**
 * Function to get the sell events occurred between the two timestamps in the form of an object [{ time: 'time', price: 'price'}].
 * @param string contractAddress, the contract address of the collection.
 * @param int firstTimestamp, show events listed after this timestamp.
 * @param int secondTimestamp, show events listed before this timestamp.
 * @returns {object} object with data of time and sell price [{ time: 'time', price: 'price'}].
 */
function createArrayWithPrices (contractAddress, firstTimestamp, secondTimestamp) {
    // to be implemented
}
