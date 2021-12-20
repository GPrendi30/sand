const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../login');
const getOptionForDailyVolume = require('../option.js').getOptionForDailyVolume
const getOptionForScatterChart = require('../option.js').getOptionForScatterChart
const getOptionForDailySales = require('../option.js').getOptionForDailySales
const getOptionForAveragePrice = require('../option.js').getOptionForAveragePrice
const getVolumeChartWithAverageLine = require('../option.js').getVolumeChartWithAverageLine

/* GET graph page. */
router.get('/', isLoggedIn, function (req, res, next) {
    res.render('graph')
})

/* GET the graph types. */
router.get('/types', function (req, res, next) {
    // TODO: enum with the current graph types (json)
    if (req.accepts('json')) {
        res.status(200).send({ types: ['bar', 'scatter'] })
    } else {
        res.status(406).end();
    }
})

/* GET the graph data types. */
router.get('/data', async function (req, res, next) {
    const chartType = req.query.chart
    const contractSlug = req.query.slug
    const time = req.query.time

    if (req.accepts('json')) {
        if (chartType === 'dailyVolume') {
            const option = await getOptionForDailyVolume(contractSlug, time);
            res.status(200).send(option);
        } else if (chartType === 'dailySales') {
            const option = await getOptionForDailySales(contractSlug, time);
            console.log(option);
            res.status(200).send(option);
        } else if (chartType === 'scatter') {
            const option = await getOptionForScatterChart(contractSlug, time)
            res.status(200).send(option);
        } else if (chartType === 'averageLine') {
            const option = await getOptionForAveragePrice(contractSlug, time);
            console.log(option);
            res.status(200).send(option);
        } else if (chartType === 'volumeWithAverageLine') {
            const option = await getVolumeChartWithAverageLine(contractSlug, time);
            console.log(option);
            res.status(200).send(option);
        } else {
            res.status(404).end()
        }
    } else {
        res.status(406).end()
    };
})

// export the required modules
module.exports = router
