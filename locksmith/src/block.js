const models = require('../models')

models.Block.removeAttribute('id')
module.exports = models.Block
