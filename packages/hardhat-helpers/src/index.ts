import balance from './balance'
import constants from './constants'
import etherscan from './etherscan'
import fixtures from './fixtures'
import fork from './fork'
import lock from './lock'
import networks from './networks'
import proxy from './proxy'
import tasks from './tasks'
import tokens from './tokens'
import uniswap from './uniswap'
import unlock from './unlock'
import upgrades from './upgrades'
import localhost from './localhost'
import events from './events'
import deploy from './deploy'
import roles from './roles'

module.exports = {
  ...balance,
  ...constants,
  etherscan,
  ...fixtures,
  ...fork,
  ...lock,
  networks,
  ...proxy,
  ...tasks,
  ...tokens,
  ...uniswap,
  ...unlock,
  ...upgrades,
  ...localhost,
  ...events,
  ...deploy,
  ...roles,
}
