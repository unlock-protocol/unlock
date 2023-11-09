const tasks = require('./tasks')
import networks from './networks'
import etherscan from './etherscan'
import balance from './balance'
import constants from './constants'
import lock from './lock'

module.exports = {
  networks,
  etherscan,
  tasks,
  ...balance,
  ...constants,
  ...lock,
}
