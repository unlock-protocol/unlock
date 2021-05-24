import { ethers } from 'ethers'
import ethersUtils from '../utils'

describe('ethers utils', () => {
  it('toWei', () => {
    expect.assertions(2)

    expect(ethersUtils.toWei('1000', 'ether')).toEqual(
      ethers.BigNumber.from('1000000000000000000000')
    )

    expect(ethersUtils.toWei('1000000000000', 'gwei')).toEqual(
      ethers.BigNumber.from('1000000000000000000000')
    )
  })

  describe('toDecimal', () => {
    it('supports 18 decimals - which is the most frequent erc20', () => {
      expect.assertions(2)

      expect(ethersUtils.toDecimal('1', 18)).toEqual(
        ethers.BigNumber.from('1000000000000000000')
      )

      expect(ethersUtils.toDecimal('100', 18)).toEqual(
        ethers.BigNumber.from('100000000000000000000')
      )
    })

    it('supports 0 decimal', () => {
      expect.assertions(2)

      expect(ethersUtils.toDecimal('1000', 0)).toEqual(
        ethers.BigNumber.from('1000')
      )

      expect(ethersUtils.toDecimal('1000000000000', 0)).toEqual(
        ethers.BigNumber.from('1000000000000')
      )
    })
  })

  it('hexToNumberString', () => {
    expect.assertions(2)

    const bigNumber = 132654781356418

    expect(ethersUtils.hexToNumberString('0x00')).toBe('0')
    expect(ethersUtils.hexToNumberString(`0x${bigNumber.toString(16)}`)).toBe(
      `${bigNumber}`
    )
  })

  it('fromWei', () => {
    expect.assertions(3)

    expect(ethersUtils.fromWei('1000000000000000000000', 'ether')).toEqual(
      '1000'
    )

    expect(ethersUtils.fromWei('1000000000000000000000', 'gwei')).toEqual(
      '1000000000000'
    )

    expect(ethersUtils.fromWei('100000000', 'ether')).toEqual('0.0000000001')
  })

  describe('fromDecimal', () => {
    it('should support 18 decimals', () => {
      expect.assertions(2)

      expect(ethersUtils.fromDecimal('1000000000000000000000', 18)).toEqual(
        '1000'
      )

      expect(ethersUtils.fromDecimal('100000000', 18)).toEqual('0.0000000001')
    })

    it('should support 0 decimals', () => {
      expect.assertions(2)

      expect(ethersUtils.fromDecimal('1000', 0)).toEqual('1000')

      expect(ethersUtils.fromDecimal('100000000', 0)).toEqual('100000000')
    })
  })

  it('isInfiniteKeys', () => {
    expect.assertions(2)

    expect(ethersUtils.isInfiniteKeys(50000000000)).toBe(false)
    expect(
      ethersUtils.isInfiniteKeys(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
    ).toBe(true)
  })

  it('toNumber', () => {
    expect.assertions(3)

    expect(ethersUtils.toNumber('0x12355')).toBe(74581)
    expect(ethersUtils.toNumber(74581)).toBe(74581)
    expect(ethersUtils.toNumber(ethers.BigNumber.from('0x12355'))).toBe(74581)
  })

  it('rpcResultNumber', () => {
    expect.assertions(4)

    expect(ethersUtils.toRpcResultNumber(0)).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    )

    expect(ethersUtils.toRpcResultNumber(100000)).toBe(
      '0x00000000000000000000000000000000000000000000000000000000000186a0'
    )

    expect(ethersUtils.toRpcResultNumber('0x12345')).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000012345'
    )

    expect(
      ethersUtils.toRpcResultNumber(ethers.BigNumber.from('0x12345'))
    ).toBe('0x0000000000000000000000000000000000000000000000000000000000012345')
  })

  it('utf8ToHex', () => {
    expect.assertions(2)

    expect(ethersUtils.utf8ToHex('hi there')).toBe('0x6869207468657265')
    expect(ethersUtils.utf8ToHex('I like turtles')).toBe(
      '0x49206c696b6520747572746c6573'
    )
  })

  it('verifyMessage', () => {
    expect.assertions(1)

    const signature =
      '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63' +
      '265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8' +
      '1c'

    expect(ethersUtils.verifyMessage('hello world', signature)).toBe(
      '0x14791697260E4c9A71f18484C9f997B308e59325'
    )
  })
})
