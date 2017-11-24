const router = require('koa-router')()

const ipaController = require('../controllers/ipa');
const apkController = require('../controllers/apk');

router.get('/', async (ctx, next) => {
    await ctx.render('upload')
})
router.post('/', (ctx, next) => ipaController.upload(ctx, next));

router.get('/apk', async (ctx, next) => {
    await ctx.render('uploadapk')
})
router.post('/apk', (ctx, next) => apkController.upload(ctx, next));

module.exports = router
