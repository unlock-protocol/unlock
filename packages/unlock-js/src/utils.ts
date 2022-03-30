import { ethers } from 'ethers'

// this allows us to flexibly upgrade web3 and fix bugs as they surface
// or to migrate to a totally different library and have a single point of modification
export default {
  toWei: (value: string, units: ethers.BigNumberish) =>
    ethers.utils.parseUnits(value, units),
  // This converts a string representation from a value to a number of units, based on the number of decimals passed in
  toDecimal: (value: string, decimals: number) =>
    ethers.utils.parseUnits(value, decimals),
  hexlify: ethers.utils.hexlify,
  hexStripZeros: ethers.utils.hexStripZeros,
  bigNumberify: ethers.BigNumber.from,
  hexToNumberString: (num: number) =>
    ethers.utils
      .formatUnits(ethers.BigNumber.from(num), 'wei')
      .replace('.0', ''),
  toChecksumAddress: ethers.utils.getAddress,
  fromWei: (num: ethers.BigNumber, units: ethers.BigNumberish) => {
    return ethers.utils
      .formatUnits(ethers.BigNumber.from(num), units)
      .replace(/\.0$/, '')
  },
  // This converts a string representation from a unit value to a higher base
  fromDecimal: (num: string, decimals: number) => {
    return ethers.utils
      .formatUnits(ethers.BigNumber.from(num), decimals)
      .replace(/\.0$/, '')
  },
  isInfiniteKeys: (value: string) => {
    return ethers.BigNumber.from(value).eq(ethers.constants.MaxUint256)
  },
  isInfiniteDuration: (value: string) => {
    return ethers.BigNumber.from(value).eq(ethers.constants.MaxUint256)
  },
  toNumber: (value: string) => {
    return ethers.BigNumber.from(value).toNumber()
  },
  toRpcResultNumber: (value: number) => {
    const num = ethers.utils.hexlify(ethers.BigNumber.from(value))
    return ethers.utils.hexZeroPad(num, 32)
  },
  toRpcResultString: (str: string) => {
    return str
  },
  utf8ToHex: (str: string) =>
    ethers.utils.hexlify(str.length ? ethers.utils.toUtf8Bytes(str) : 0),
  sha3: ethers.utils.keccak256,
  verifyMessage: ethers.utils.verifyMessage,
}
