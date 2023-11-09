const tasks = require('./tasks')
import networks from './networks'
import etherscan from './etherscan'
import balance from './balance'
import constants from './constants'
import lock from './lock'
import upgrades from './upgrades'

module.exports = {
  networks,
  etherscan,
  tasks,
  ...balance,
  ...constants,
  ...lock,
  ...upgrades,
}
