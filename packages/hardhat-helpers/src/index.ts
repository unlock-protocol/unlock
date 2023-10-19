const { etherscan } = require('./etherscan')
const { networks } = require('./networks')
const tasks = require('./tasks')
const gov = require('./gov')
const balance = require('./balance')

module.exports = {
  networks,
  etherscan,
  tasks,
  ...gov,
  ...balance,
}
