const rewire = require('rewire')
const routesFunc = rewire('../api.js')
const assert = require('chai').assert
const expect = require('chai').expect
// const axios = require('axios').default;
require('dotenv').config();

const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);

// Test for function getCollectionData
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

// Test for function getSalesFromStartToEnd
describe('Testing fetching sales data of a collection', function () {
    it('Get sales data using the collection address and two timestamps', function (done) {
        
        const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const getSalesFromStartToEnd = routesFunc.__get__('getSalesFromStartToEnd')
        
        getSalesFromStartToEnd(collectionAddress, currentTimestamp - 86400 * 1, currentTimestamp - 86400 * 0)
        .then(data => {
            assert(data.transaction)
            assert(data.total_price)
        })
        done()
    });
})

// Test for function createArrayWithPrices
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

// Test for function pullTokenDataByID
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
// Test for function dailyVolume
describe('Testing fetching volume of a collection', function () {
    this.timeout(15000);
    const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
    const collectionSlug = 'cool-cats-nft';

    const dailyVolume = routesFunc.__get__('dailyVolume')
    const getCollectionData = routesFunc.__get__('getCollectionData')

    it('Get the volume of a single collection in the last 1 days', function (done) {

        const timeInDays = 1
        dailyVolume(collectionAddress, timeInDays)
            .then(volumeArray => {
                assert.equal(volumeArray.length, timeInDays);
                volumeArray.forEach(vol => {
                    expect(vol).to.be.at.least(0);
                });
                let sum = volumeArray.reduce((a, b) => a + b, 0)
                getCollectionData('cool-cats-nft')
                    .then(data => {
                        let oneDayVolumeFromOS = data.collection.stats.one_day_volume
                        expect(sum).to.be.within(oneDayVolumeFromOS - 50, oneDayVolumeFromOS + 50);
                    })
                done()
            })
        })

    it('Get the volume of a single collection in the last 3 days', function (done) {

        const timeInDays = 3
        dailyVolume(collectionAddress, timeInDays)
            .then(volumeArray => {
                assert.equal(volumeArray.length, timeInDays);
                volumeArray.forEach(vol => {
                    expect(vol).to.be.at.least(0);
                });
                done()
            })
        })

    it('Get the volume of a single collection in the last 5 days', function (done) {

        const timeInDays = 5
        dailyVolume(collectionAddress, timeInDays)
            .then(volumeArray => {
                assert.equal(volumeArray.length, timeInDays);
                volumeArray.forEach(vol => {
                    expect(vol).to.be.at.least(0);
                });
                done()
            })
        })

    it('Get the volume of a single collection in the last 7 days', function (done) {

        const timeInDays = 7
        dailyVolume(collectionAddress, timeInDays)
            .then(volumeArray => {
                assert.equal(volumeArray.length, timeInDays);
                volumeArray.forEach(vol => {
                    expect(vol).to.be.at.least(0);
                });

                let sum = volumeArray.reduce((a, b) => a + b, 0)
                getCollectionData('cool-cats-nft')
                    .then(data => {
                        let sevenDayVolumeFromOS = data.collection.stats.one_day_volume
                        expect(sum).to.be.within(sevenDayVolumeFromOS - 50, sevenDayVolumeFromOS + 50);
                    })
                done()
            })
        })
})