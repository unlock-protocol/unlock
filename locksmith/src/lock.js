const models = require('../models')

models.Lock.removeAttribute('id')
module.exports = models.Lock
export default models.Lock
