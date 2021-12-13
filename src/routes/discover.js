const express = require('express')
const router = express.Router()
const getCollectionDataWithSlug = require('../api.js').getCollectionDataWithSlug;

const collectionSlugs = [
    'cryptopunks', 'boredapeyachtclub', 'akc', 'neotokyo-outer-identities', 'clonex-mintvial',
    'sandbox', 'superrare', 'crypto-bull-society', 'punks-comic', 'collectvoxmirandus', 'mutant-ape-yacht-club',
    'decentraland', 'art-blocks', 'desperate-ape-wives', 'wizards-dragons-game-v2'
]

// let collection = [{"title": "Animal Pattern" , "img" : "/images/animal_pattern.jpg" }, {"title": "Abstract Art" , "img" : "/images/abstract_art.jpg" },{"title": "Dark" , "img" : "/images/dark_art.jpg" }]

/* GET discover page. */
router.get('/', async function (req, res, next) {
    if (req.accepts('json')) {
        const collection = [];
        await Promise.all(collectionSlugs.map(async slug => {
            const data = await getCollectionDataWithSlug(slug)
            if (data) {
                collection.push({ title: data.collection.name, img: data.collection.image_url, link: '/discover/' + slug }) // get large image => substitute data.collection.image_url with data.collection.large_image_url
            }
        }))
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
        res.render('single_collection', { data: collectionData })
    } else {
        res.status(406).end();
    }
})

// export the required modules
module.exports = router
