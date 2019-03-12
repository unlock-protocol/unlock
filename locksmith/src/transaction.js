const models = require('../models')

models.Transaction.removeAttribute('id')
module.exports = models.Transaction
export default models.Transaction
