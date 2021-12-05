const express = require('express')
const router = express.Router()
const getOptionForBarChart = require('../option.js').getOptionForBarChart
const getOptionForScatterChart = require('../option.js').getOptionForScatterChart

/* GET graph page. */
router.get('/', function (req, res, next) {
    res.render('graph')
})

/* GET the graph types. */
router.get('/types', async function (req, res, next) {
    const chartType = req.query.chart
    const contractAddress = req.query.address
    const time = req.query.time

    if (req.accepts('json')) {
        if (chartType === 'bar') {
            const option = await getOptionForBarChart(contractAddress, time);
            res.status(200).send(option);
        } else if (chartType === 'scatter') {
            const option = await getOptionForScatterChart(contractAddress, time)
            res.status(200).send(option);
        } else {
            res.status(404).end()
        }
    } else {
        res.status(406).end()
    };
})

/* GET the graph data types. */
router.get('/data_type', function (req, res, next) {
    // to complete
    res.send('route not implemented yet')
})

/* GET the graph period. */
router.get('/period', function (req, res, next) {
    // to complete
    res.send('route not implemented yet')
})

/* GET the transactions graph. */
router.get('/transaction', function (req, res, next) {
    // to complete
    res.send('route not implemented yet')
})

// export the required modules
module.exports = router
