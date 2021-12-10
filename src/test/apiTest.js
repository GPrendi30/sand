const rewire = require('rewire')
const routesFunc = rewire('../api.js')
const assert = require('chai').assert
const expect = require('chai').expect
// const axios = require('axios').default;
require('dotenv').config();

const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);

// Test for function getCollectionDataWithSlug
describe('Fetching general data of a collection', function () {
    it('Using getCollectionDataWithSlug with collection slug', function (done) {

        const collectionSlug = 'doodles-official';
        const getCollectionDataWithSlug = routesFunc.__get__('getCollectionDataWithSlug')
        
        getCollectionDataWithSlug(collectionSlug)
        .then(data => {
            assert(data.collection)
            assert(data.collection.stats)
            done()
        })
    });
})

// Test for function getCollectionDataWithAddress
describe('Fetching general data of a collection', function () {
    it('Using getCollectionDataWithAddress with collection address', function (done) {

        const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const getCollectionDataWithAddress = routesFunc.__get__('getCollectionDataWithAddress')
        
        getCollectionDataWithAddress(collectionAddress)
        .then(data => {
            // TODO: add more tests
            // check that a result exists
            assert(data)
            done()
        })
    });
})

// Test for function getSalesFromStartToEnd
describe('Fetching sales data of a collection', function () {
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
describe('Creation of data to plot the graphs', function () {
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
describe('Fetching a single asset', function () {
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
describe('Fetching volume of a collection', function () {
    this.timeout(15000);
    const collectionAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
    const collectionSlug = 'cool-cats-nft';

    const dailyVolume = routesFunc.__get__('dailyVolume')
    const getCollectionDataWithSlug = routesFunc.__get__('getCollectionDataWithSlug')

    it('Get the volume of a single collection in the last 1 days', function (done) {

        const timeInDays = 1
        dailyVolume(collectionAddress, timeInDays)
            .then(volumeArray => {
                assert.equal(volumeArray.length, timeInDays + 1);
                volumeArray.forEach(vol => {
                    expect(vol).to.be.at.least(0);
                });
                let sum = volumeArray.reduce((a, b) => a + b, 0)
                getCollectionDataWithSlug('cool-cats-nft')
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
                assert.equal(volumeArray.length, timeInDays + 1);
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
                assert.equal(volumeArray.length, timeInDays + 1);
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
                assert.equal(volumeArray.length, timeInDays + 1);
                volumeArray.forEach(vol => {
                    expect(vol).to.be.at.least(0);
                });

                let sum = volumeArray.reduce((a, b) => a + b, 0)
                getCollectionDataWithSlug('cool-cats-nft')
                    .then(data => {
                        let sevenDayVolumeFromOS = data.collection.stats.one_day_volume
                        expect(sum).to.be.within(sevenDayVolumeFromOS - 50, sevenDayVolumeFromOS + 50);
                    })
                done()
            })
        })
})

// Test for function getCollectionsOfWallet
describe('Fetching general data of an address', function () {
    it('Using getCollectionsOfWallet with collection address', function (done) {

        const walletAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const getCollectionsOfWallet = routesFunc.__get__('getCollectionsOfWallet')
        
        getCollectionsOfWallet(walletAddress)
        .then(data => {
            // TODO: add more tests
            // check that a result exists
            assert(data)
            done()
        })
    });
})

// Test for function getWalletTokenValues
describe('Fetching the collection owned by a user through a wallet address', function () {
    it('Using getWalletTokenValues with collection address', function (done) {

        const walletAddress = '0x1a92f7381b9f03921564a437210bb9396471050c' // Cool Cats collection address
        const getWalletTokenValues = routesFunc.__get__('getWalletTokenValues')
        
        getWalletTokenValues(walletAddress)
        .then(data => {
            // TODO: add more tests
            // check that a result exists
            assert(data)
            done()
        })
    });
})

// Test for function returnDifference
describe('Getting the difference between two objects of tokens', function () {
    it('Using returnDifference with two test objects', function (done) {

        const returnDifference = routesFunc.__get__('returnDifference')

        const a = {
            nftboxes: 1,
            rarible: 4,
            sandbox: 4,
            ens: 1,
            axie: 7
        }
        
        const b = {
            rarible: 2,
            sandbox: 12,
            ens: 1,
            axie: 7,
            new_token: 666
        }
        
        const difference = returnDifference(a, b);

        assert(difference['rarible'] === -2);
        assert(difference['sandbox'] === 8);
        assert(difference['new_token'] === 666);
        assert(difference['nftboxes'] === -1);
        done()
    });
})
