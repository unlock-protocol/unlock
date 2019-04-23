import Web3Utils from 'web3-utils'

// this allows us to flexibly upgrade web3 and fix bugs as they surface
// or to migrate to a totally different library and have a single point of modification
module.exports = {
  ...Web3Utils,
}
