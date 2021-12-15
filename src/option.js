const dailyVolume = require('./api.js').dailyVolume;
const createArrayWithPrices = require('./api.js').createArrayWithPrices;
const getCollectionDataWithAddress = require('./api.js').getCollectionDataWithAddress;
const getCollectionDataWithSlug = require('./api.js').getCollectionDataWithSlug;
const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);
const lastMidnight = new Date(currentDate.setHours(0, 0, 0, 0));
const lastMidnightTimestamp = Math.trunc(lastMidnight.getTime() / 1000);

/**
 * Function to generate the options for a bar chart.
 * @param string contractAddress, the contract address of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getOptionForBarChart (contractAddress, timeInDays) {
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
        dailyVolumeArray = await dailyVolume(contractAddress, timeInDays)
        title = (await getCollectionDataWithAddress(contractAddress)).collection.name;

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
    } catch (error) { console.error(error); }

    return option
}

/**
 * Function to generate the options for a scatter chart.
 * @param string contractAddress, the contract address of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
async function getOptionForScatterChart (contractAddress, timeInDays) {
    const startTimestamp = currentTimestamp - 86400 * timeInDays;
    const endTimestamp = currentTimestamp;

    let timePriceArray;
    let option;
    try {
        timePriceArray = await createArrayWithPrices(contractAddress, startTimestamp, endTimestamp)

        const plottedTimePriceArray = [];
        timePriceArray.forEach(data => {
            plottedTimePriceArray.push(
                [data.timestamp, data.price]
            )
        })

        option = {
            xAxis: {
                type: 'time'
            },
            yAxis: {},
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

module.exports.getOptionForBarChart = getOptionForBarChart;
module.exports.getOptionForScatterChart = getOptionForScatterChart;
