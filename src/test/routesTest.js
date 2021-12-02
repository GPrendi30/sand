const rewire = require('rewire')
const routesFunc = rewire('../public/js/routes.js')
const assert = require('chai').assert
// const expect = require('chai').expect
// const axios = require('axios').default;
require('dotenv').config();

const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);


describe('Testing fetching general data of a collection', function () {
    it('Using getCollectionData with collection slug', function (done) {

        const collectionSlug = 'doodles-official';
        const getCollectionData = routesFunc.__get__('getCollectionData')
        
        getCollectionData(collectionSlug)
        .then(data => {
            assert(data.collection)
            assert(data.collection.stats)
            done()
        })
    });
})

describe('Testing fetching sales data of a collection', function () {
    it('Get sales data using the collection address and two timestamps', function (done) {
        
        const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const getSalesFromTimeToTime = routesFunc.__get__('getSalesFromTimeToTime')
        
        getSalesFromTimeToTime(collectionAddress, currentTimestamp - 86400 * 1, currentTimestamp - 86400 * 0)
        .then(data => {
            assert(data.transaction)
            assert(data.total_price)
        })
        done()
    });
})

describe('Testing creation of data to plot the graphs', function () {
    it('Create the array of objects with data for the graphs', function (done) {

        const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const createArrayWithPrices = routesFunc.__get__('createArrayWithPrices')

        createArrayWithPrices(collectionAddress, currentTimestamp - 86400 * 1, currentTimestamp - 86400 * 0) // timestamps set from 24h ago to current time
        .then(data => {
            data.forEach(obj => {
                assert(obj.timestamp)
                assert(obj.price)
            })
            done()
        })
    });
})

describe('Testing fetching a single asset', function () {
    it('Get the data of a single asset from the collection address and the token ID', function (done) {

        const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const tokenID = 754
        const pullTokenDataByID = routesFunc.__get__('pullTokenDataByID')

        pullTokenDataByID(collectionAddress, tokenID)
            .then(token => {
                assert.equal(token.token_id, tokenID);
                assert.equal(token.asset_contract.address, collectionAddress);
            })
            done()
        })
})
