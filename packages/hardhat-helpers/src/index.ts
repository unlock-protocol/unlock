const { etherscan } = require('./etherscan')
const { networks } = require('./networks')
const tasks = require('./tasks')
const balance = require('./balance')
const constants = require('./constants')

module.exports = {
  networks,
  etherscan,
  tasks,
  ...balance,
  ...constants,
}
