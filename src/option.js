const dailyVolume = require('./api.js').dailyVolume;
const dailySales = require('./api.js').dailySales;
const createArrayWithPricesFromSlug = require('./api.js').createArrayWithPricesFromSlug;
const getCollectionDataWithAddress = require('./api.js').getCollectionDataWithAddress;
const getCollectionDataWithSlug = require('./api.js').getCollectionDataWithSlug;
const getVolumeFromCache = require('./api.js').getVolumeFromCache;
const getAllSalesFromStart = require('./api.js').getAllSalesFromStart
const getSalesFromCache = require('./api.js').getSalesFromCache
const plotVolumeBarData = require('./api.js').plotVolumeBarData
const plotVolumeNumSalesData = require('./api.js').plotVolumeNumSalesData
const plotAveragePriceData = require('./api.js').plotAveragePriceData
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
async function getOptionForDailyVolume (collectionSlug, timeInDays) {
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
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name;
        dailyVolumeArray = await plotVolumeBarData(collectionSlug, timeInDays)

        option = {
            title: {
                show: true,
                text: title,
                left: 'center'
            },
            tooltip: {
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            toolbox: {
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                data: ['Daily Volume'],
                bottom: 0
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
                    name: 'Daily Volume',
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
    // const startTimestamp = (Date.now() / 1000) - 86400 * timeInDays;
    // const endTimestamp = (Date.now() / 1000);

    let timePriceArray;
    let option;
    let title;

    try {
        const timestamp = Math.trunc((Date.now() / 1000) - 86400 * timeInDays)
        // const timestamp = Math.trunc(new Date((Date.now()).getTime() - 86400 * timeInDays) / 1000)
        timePriceArray = await getSalesFromCache(collectionSlug, timestamp)
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name

        const plottedTimePriceArray = [];
        timePriceArray.forEach(data => {
            plottedTimePriceArray.push(
                [data.t, data.p]
            )
        })

        option = {
            title: {
                show: true,
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                data: ['Sales'],
                bottom: 0
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
                    name: 'Sales',
                    symbolSize: 7.5,
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
        dailySalesArray = await plotVolumeNumSalesData(collectionSlug, timeInDays)
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name;

        option = {
            title: {
                show: true,
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            toolbox: {
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                data: ['Number of sales'],
                bottom: 0
            },
            xAxis: {
                type: 'category',
                data: dateArray
                // name: 'Dates'
            },
            yAxis: {
                name: 'Number of sales',
                type: 'value'
            },
            series: [
                {
                    name: 'Number of sales',
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

/**
 * Function to generate the options for a daily sales bar chart.
 * @param string collectionSlug, the slug of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getOptionForAveragePrice (collectionSlug, timeInDays) {
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

    let dailyAverageArray;
    let option;
    let title;
    try {
        dailyAverageArray = await plotAveragePriceData(collectionSlug, timeInDays)
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name;

        option = {
            title: {
                show: true,
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            toolbox: {
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                data: ['Average Price'],
                bottom: 0
            },
            xAxis: {
                type: 'category',
                data: dateArray
                // name: 'Dates'
            },
            yAxis: {
                name: 'Number of sales',
                type: 'value'
            },
            series: [
                {
                    name: 'Average Price',
                    data: dailyAverageArray,
                    type: 'line',
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

/**
 * Function to generate the options for a scatter chart.
 * @param string collectionSlug, the slug of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getVolumeChartWithAverageLine (collectionSlug, timeInDays) {
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
    let dailyAverageArray
    try {
        title = (await getCollectionDataWithSlug(collectionSlug)).collection.name;
        dailyVolumeArray = await plotVolumeBarData(collectionSlug, timeInDays)
        dailyAverageArray = await plotAveragePriceData(collectionSlug, timeInDays)

        option = {
            title: {
                show: true,
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                },
                formatter: function (args) {
                    return 'Date + ' + args[0].name + ': ' + args[0].value
                }
            },
            toolbox: {
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                data: ['Volume', 'Average Price'],
                bottom: 0
            },
            xAxis: {
                type: 'category',
                data: dateArray
            },
            yAxis: [
                {
                    name: 'Volume (ETH)',
                    type: 'value'
                },
                {
                    name: 'Average Price (ETH)',
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Volume',
                    data: dailyVolumeArray.map(data => data.toFixed(2)),
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    }
                },
                {
                    name: 'Average Price',
                    data: dailyAverageArray,
                    type: 'line',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    },
                    yAxisIndex: 1
                }
            ]
        }

        return option
    } catch (error) { console.error(error); }
}

module.exports.getOptionForDailyVolume = getOptionForDailyVolume
module.exports.getOptionForScatterChart = getOptionForScatterChart
module.exports.getOptionForDailySales = getOptionForDailySales
module.exports.getOptionForAveragePrice = getOptionForAveragePrice
module.exports.getVolumeChartWithAverageLine = getVolumeChartWithAverageLine
