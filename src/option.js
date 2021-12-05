const dailyVolume = require('./api.js').dailyVolume;
const createArrayWithPrices = require('./api.js').createArrayWithPrices;
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
function getOptionForBarChart (contractAddress, timeInDays) {
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

    dailyVolume(contractAddress, timeInDays)
        .then(dailyVolumeArray => {
            const option = {
                xAxis: {
                    type: 'category',
                    data: dateArray
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: dailyVolumeArray,
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)'
                        }
                    }
                ]
            };
            console.log(option.xAxis.data)
            console.log(option.series[0].data)
            return option
        });
}

/**
 * Function to generate the options for a scatter chart.
 * @param string contractAddress, the contract address of the collection.
 * @param int timeInDays, the number of the days you want to get the volume of (e.g. 7 means the last 7 days).
 * @returns {array} object option that is used to draw the chart.
 */
function getOptionForScatterChart (contractAddress, timeInDays) {
    const startTimestamp = currentTimestamp - 86400 * timeInDays;
    const endTimestamp = currentTimestamp;

    createArrayWithPrices(contractAddress, startTimestamp, endTimestamp)
        .then(timePriceArray => {
            const plottedTimePriceArray = [];
            timePriceArray.forEach(data => {
                plottedTimePriceArray.push(
                    [data.timestamp, data.price]
                )
            })

            const option = {
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

            return option
        });
}

module.exports.getOptionForBarChart = getOptionForBarChart;
