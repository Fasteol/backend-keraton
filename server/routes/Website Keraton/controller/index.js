var express = require('express')
var router = express.Router()
const controlContent = require('../controller/contents.controller')
const controlPage = require('../controller/pages.controller')
const controlAuth = require('../controller/auth.controller')
const controlEvent = require('../controller/event.controller')
const controlPurchasable = require('../controller/purchasable.controller')
const controlIteration = require('../controller/eventIterarion.controller')

router.use('/content', controlContent)
router.use('/page', controlPage)
router.use('/auth', controlAuth)
router.use('/event', controlEvent)
router.use('/items', controlPurchasable)
router.use('/iteration', controlIteration)

module.exports = router
