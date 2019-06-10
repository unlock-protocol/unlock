import { ethers } from 'ethers'

// this allows us to flexibly upgrade web3 and fix bugs as they surface
// or to migrate to a totally different library and have a single point of modification
export default {
  toWei: (value, units) => ethers.utils.parseUnits(value, units),
  // This converts a string representation from a value to a number of units, based on the number of decimals passed in
  toDecimal: (value, decimals) => ethers.utils.parseUnits(value, decimals),
  hexlify: ethers.utils.hexlify,
  hexStripZeros: ethers.utils.hexStripZeros,
  bigNumberify: ethers.utils.bigNumberify,
  hexToNumberString: num =>
    ethers.utils
      .formatUnits(ethers.utils.bigNumberify(num), 'wei')
      .replace('.0', ''),
  toChecksumAddress: ethers.utils.getAddress,
  fromWei: (num, units) => {
    return ethers.utils
      .formatUnits(ethers.utils.bigNumberify(num), units)
      .replace(/\.0$/, '')
  },
  // This converts a string representation from a unit value to a higher base
  fromDecimal: (num, decimals) => {
    return ethers.utils
      .formatUnits(ethers.utils.bigNumberify(num), decimals)
      .replace(/\.0$/, '')
  },
  isInfiniteKeys: value => {
    return ethers.utils.bigNumberify(value).eq(ethers.constants.MaxUint256)
  },
  toNumber: value => {
    return ethers.utils.bigNumberify(value).toNumber()
  },
  toRpcResultNumber: number => {
    const num = ethers.utils.hexlify(ethers.utils.bigNumberify(number))
    return ethers.utils.hexZeroPad(num, 32)
  },
  toRpcResultString: string => {
    return string
  },
  utf8ToHex: str =>
    ethers.utils.hexlify(str.length ? ethers.utils.toUtf8Bytes(str) : 0),
  sha3: ethers.utils.keccak256,
  verifyMessage: ethers.utils.verifyMessage,
}
