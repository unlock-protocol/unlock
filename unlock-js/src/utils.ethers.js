import { utils } from 'ethers'

// this allows us to flexibly upgrade web3 and fix bugs as they surface
// or to migrate to a totally different library and have a single point of modification
module.exports = {
  toWei: (value, units) => utils.parseUnits(value, units),
  hexlify: utils.hexlify,
  hexStripZeros: utils.hexStripZeros,
  bigNumberify: utils.bigNumberify,
  hexToNumberString: num =>
    utils.formatUnits(utils.bigNumberify(num), 'wei').replace('.0', ''),
  fromWei: (num, units) =>
    utils.formatUnits(utils.bigNumberify(num), units).replace('.0', ''),
}
