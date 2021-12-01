const rewire = require('rewire')
const routesFunc = rewire('../public/js/routes.js')
const assert = require('chai').assert
const expect = require('chai').expect

const currentDate = new Date();
const currentTimestamp = Math.trunc(currentDate.getTime() / 1000);


describe('Testing fetching general data of a collection', function () {
        it('Using getCollectionData with collection slug', function (done) {

            const getCollectionData = routesFunc.__get__('getCollectionData')
            const data = getCollectionData('doodles-official')

            expect(data.collection).to.be.not.undefined
            expect(data.stats).to.be.not.undefined
            done()
        });
})

describe('Testing fetching sales data of a collection', function () {
    it('Get sales data using the collection address and two timestamps', function (done) {
        
        const getSalesFromTimeToTime = routesFunc.__get__('getSalesFromTimeToTime')
        const data = getSalesFromTimeToTime('0x1a92f7381b9f03921564a437210bb9396471050c', currentTimestamp - 86400 * 1, currentTimestamp - 86400 * 0)

        expect(data.transaction).to.be.not.undefined
        expect(data.total_price).to.be.not.undefined
        done()
    });
})

describe('Testing fetching sales data of a collection', function () {
    it('Get general data using the collction slug', function (done) {
        
        const createArrayWithPrices = routesFunc.__get__('createArrayWithPrices')
        const data = createArrayWithPrices('0x1a92f7381b9f03921564a437210bb9396471050c', currentTimestamp - 86400 * 1, currentTimestamp - 86400 * 0)

        expect(data.timestamp).to.be.not.undefined
        expect(data.price).to.be.not.undefined
        done()
    });
})