const lock = require('./lock')
const constants = require('./constants')
const errors = require('./errors')
const tokens = require('./tokens')
const uniswap = require('./uniswap')
const deployLocks = require('./deployLocks')
const deployContracts = require('../fixtures/deploy.js')

module.exports = {
  deployContracts,
  ...lock,
  ...errors,
  ...constants,
  ...tokens,
  ...uniswap,
  ...deployLocks,
}
