import { ethers } from 'ethers'

// this allows us to flexibly upgrade web3 and fix bugs as they surface
// or to migrate to a totally different library and have a single point of modification
export default {
  toWei: (value: string, units: ethers.BigNumberish) =>
    ethers.parseUnits(value, units),
  // This converts a string representation from a value to a number of units, based on the number of decimals passed in
  toDecimal: (value: string, decimals: number) =>
    ethers.parseUnits(value, decimals),
  hexlify: ethers.toBeHex,
  hexStripZeros: ethers.stripZerosLeft,
  bigNumberify: BigInt,
  hexToNumberString: (num: number) =>
    ethers.formatUnits(BigInt(num), 'wei').replace('.0', ''),
  toChecksumAddress: ethers.getAddress,
  fromWei: (num: bigint, units: ethers.BigNumberish) => {
    return ethers.formatUnits(BigInt(num), units).replace(/\.0$/, '')
  },
  // This converts a string representation from a unit value to a higher base
  fromDecimal: (num: string, decimals: number) => {
    return ethers.formatUnits(BigInt(num), decimals).replace(/\.0$/, '')
  },
  isInfiniteKeys: (value: string) => {
    return BigInt(value) === ethers.MaxUint256
  },
  isInfiniteDuration: (value: string) => {
    return BigInt(value) === ethers.MaxUint256
  },
  toNumber: ethers.toNumber,
  toRpcResultNumber: (value: bigint) => {
    const num = ethers.toBeArray(value)
    return ethers.zeroPadValue(ethers.getBytes(num), 32)
  },
  toRpcResultString: (str: string) => {
    return str
  },
  utf8ToHex: (str: string) =>
    ethers.hexlify(ethers.toUtf8Bytes(str.length ? str : '0x')),
  sha3: ethers.keccak256,
  verifyMessage: ethers.verifyMessage,
}

export class FetchError extends Error {
  response: Response

  data: {
    message: string
  }

  constructor({
    message,
    response,
    data,
  }: {
    message: string
    response: Response
    data: {
      message: string
    }
  }) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError)
    }

    this.name = 'FetchError'
    this.response = response
    this.data = data || { message }
  }
}
