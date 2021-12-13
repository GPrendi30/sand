const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../login');
const getOptionForBarChart = require('../option.js').getOptionForBarChart
const getOptionForScatterChart = require('../option.js').getOptionForScatterChart

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
    const contractAddress = req.query.address
    const time = req.query.time
    console.log(`${chartType} ${contractAddress} ${time}`)
    if (req.accepts('json')) {
        if (chartType === 'bar') {
            const option = await getOptionForBarChart(contractAddress, time);
            console.log(option);
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

// export the required modules
module.exports = router
