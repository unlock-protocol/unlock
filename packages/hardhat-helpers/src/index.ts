const tasks = require('./tasks')
import networks from './networks'
import etherscan from './etherscan'
import balance from './balance'
import constants from './constants'
import lock from './lock'
import upgrades from './upgrades'
import versions from './versions'
import proxy from './proxy'
import fixtures from './fixtures'

module.exports = {
  networks,
  etherscan,
  tasks,
  ...proxy,
  ...balance,
  ...constants,
  ...lock,
  ...upgrades,
  ...versions,
  ...fixtures,
}
