const { etherscan } = require('./etherscan')
const { networks } = require('./networks')
const tasks = require('./tasks')
const gov = require('./gov')

module.exports = {
  networks,
  etherscan,
  tasks,
  ...gov,
}
