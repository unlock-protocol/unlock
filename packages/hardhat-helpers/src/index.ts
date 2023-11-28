const tasks = require('./tasks')
import networks from './networks'
import etherscan from './etherscan'
import balance from './balance'
import constants from './constants'
import lock from './lock'
import upgrades from './upgrades'
import versions from './unlock'
import proxy from './proxy'
import fixtures from './fixtures'
import uniswap from './uniswap'
import fork from './fork'
import tokens from './tokens'

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
  ...uniswap,
  ...fork,
  ...tokens,
}
