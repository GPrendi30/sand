const express = require('express')
const router = express.Router()
const getCollectionDataWithSlug = require('../api.js').getCollectionDataWithSlug;
const getCollections = require('../api.js').getCollections;

const redis = require('./redis').client;
const returnGetSlugObjectFromCache = require('../api.js').returnGetSlugObjectFromCache;

/* GET discover page. */
router.get('/', async function (req, res, next) {
    if (req.accepts('json')) {
        const collection = await getCollections();
        res.send(collection);
    } else {
        res.status(406).end();
    }
})

/* GET discover page. */
router.get('/:slug', async function (req, res, next) {
    const slug = req.params.slug
    if (req.accepts('json')) {
        let collectionData;
        redis.hget('get_' + slug, 'title').then(async res => {
            if (res === null) {
                const data = await getCollectionDataWithSlug(slug)
                if (data) {
                    collectionData = {
                        title: data.collection.name,
                        slug: slug,
                        img: data.collection.image_url,
                        banner_img: data.collection.banner_image_url,
                        OpenSea_link: 'https://opensea.io/collection/' + slug,
                        total_volume: data.collection.stats.total_volume,
                        num_owners: data.collection.stats.num_owners,
                        num_assets: data.collection.stats.count
                    }
                }
            } else {
                collectionData = await returnGetSlugObjectFromCache(slug)
            }
        })

        res.render('single_collection', { data: collectionData })
    } else {
        res.status(406).end();
    }
})

// export the required modules
module.exports = router
