import { utils, constants } from 'ethers'

// this allows us to flexibly upgrade web3 and fix bugs as they surface
// or to migrate to a totally different library and have a single point of modification
module.exports = {
  fromWei: (num, units) => utils.formatUnits(utils.bigNumberify(num), units),
  toWei: (value, units) => utils.parseUnits(value, units),
  getContractAddress: utils.getContractAddress,
  toChecksumAddress: utils.getAddress,
  hexToNumberString: num =>
    utils.formatUnits(utils.bigNumberify(num), 'wei').replace('.0', ''),
  utf8ToHex: str => utils.hexlify(str.length ? utils.toUtf8Bytes(str) : 0),
  sha3: utils.keccak256,
  hexlify: utils.hexlify,
  hexStripZeros: utils.hexStripZeros,
  bigNumberify: utils.bigNumberify,
  isInfiniteKeys: value => {
    return utils.bigNumberify(value).eq(constants.MaxUint256)
  },
  toNumber: value => {
    return utils.bigNumberify(value).toNumber()
  },
  padLeft: (value, length) => {
    const newValue = utils.hexlify(value)
    utils.hexZeroPad(newValue, length - newValue.length + 2)
  },
}
