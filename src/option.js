const dailyVolume = require('./api.js').dailyVolume;
const dailySales = require('./api.js').dailySales;
const createArrayWithPricesFromSlug = require('./api.js').createArrayWithPricesFromSlug;
const getCollectionDataWithAddress = require('./api.js').getCollectionDataWithAddress;
const getCollectionDataWithSlug = require('./api.js').getCollectionDataWithSlug;
const getVolumeFromCache = require('./api.js').getVolumeFromCache;
const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);
const lastMidnight = new Date(currentDate.setHours(0, 0, 0, 0));
const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

/**
 * Function to generate the options for a daily volume bar chart.
 * @param string collectionSlug, the slug of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getOptionForDailyVolume (contractSlug, timeInDays) {
    const dateArray = []
    for (let i = timeInDays; i > 0; i--) {
        const date = new Date((lastMidnightTimestamp - (86400 * i)) * 1000)
        const month = date.getMonth() + 1
        const day = date.getDate()
        dateArray.push(month + '/' + day)
    }
    const date = new Date((lastMidnightTimestamp * 1000))
    const month = date.getMonth() + 1
    const day = date.getDate()
    dateArray.push(month + '/' + day)

    let dailyVolumeArray;
    let option;
    let title;
    try {
        title = (await getCollectionDataWithSlug(contractSlug)).collection.name;
        dailyVolumeArray = await getVolumeFromCache(contractSlug, timeInDays)

        option = {
            title: {
                show: true,
                text: title,
                left: 'center',
                top: 10
            },
            tooltip: {
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            xAxis: {
                type: 'category',
                data: dateArray,
                name: 'Dates'
            },
            yAxis: {
                name: 'Volume (ETH)',
                type: 'value'
            },
            series: [
                {
                    data: dailyVolumeArray.map(data => data.toFixed(2)),
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    }
                }
            ]
        }

        return option
    } catch (error) { console.error(error); }
}

/**
 * Function to generate the options for a scatter chart.
 * @param string collectionSlug, the slug of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getOptionForScatterChart (collectionSlug, timeInDays) {
    const startTimestamp = currentTimestamp - 86400 * timeInDays;
    const endTimestamp = currentTimestamp;

    let timePriceArray;
    let option;
    let title;

    try {
        timePriceArray = await createArrayWithPricesFromSlug(collectionSlug, startTimestamp, endTimestamp)
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name;

        const plottedTimePriceArray = [];
        timePriceArray.forEach(data => {
            plottedTimePriceArray.push(
                [data.timestamp, data.price]
            )
        })

        option = {
            title: {
                show: true,
                text: title,
                left: 'center',
                top: 10
            },
            tooltip: {
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            xAxis: {
                type: 'time'
            },
            yAxis: {
                name: 'Volume (ETH)',
                type: 'value'
            },
            series: [
                {
                    symbolSize: 10,
                    data: plottedTimePriceArray,
                    type: 'scatter'
                }
            ]
        }
    } catch (error) { console.error(error); }

    return option
}

/**
 * Function to generate the options for a daily sales bar chart.
 * @param string collectionSlug, the slug of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getOptionForDailySales (collectionSlug, timeInDays) {
    const dateArray = []
    for (let i = timeInDays; i > 0; i--) {
        const date = new Date((lastMidnightTimestamp - (86400 * i)) * 1000)
        const month = date.getMonth() + 1
        const day = date.getDate()
        dateArray.push(month + '/' + day)
    }
    const date = new Date((lastMidnightTimestamp * 1000))
    const month = date.getMonth() + 1
    const day = date.getDate()
    dateArray.push(month + '/' + day)

    let dailySalesArray;
    let option;
    let title;
    try {
        dailySalesArray = await dailySales(collectionSlug, timeInDays) // HERE
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name;

        option = {
            title: {
                show: true,
                text: title,
                left: 'center',
                top: 10
            },
            tooltip: {
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            xAxis: {
                type: 'category',
                data: dateArray,
                name: 'Dates'
            },
            yAxis: {
                name: 'Number of sales',
                type: 'value'
            },
            series: [
                {
                    data: dailySalesArray,
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    }
                }
            ]
        }
    } catch (error) { console.error(error); }

    return option
}

module.exports.getOptionForDailyVolume = getOptionForDailyVolume;
module.exports.getOptionForScatterChart = getOptionForScatterChart;
module.exports.getOptionForDailySales = getOptionForDailySales;
