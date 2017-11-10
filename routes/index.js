const router = require('koa-router')()

const ipaController = require('../controllers/ipa');

router.get('/', async (ctx, next) => {
    await ctx.render('upload')
})

router.post('/upload', (ctx, next) => ipaController.upload(ctx, next));

module.exports = router
