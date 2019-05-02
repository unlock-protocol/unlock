import { utils } from 'ethers'
import ethersUtils from '../utils.ethers'

describe('ethers utils', () => {
  it('toWei', () => {
    expect.assertions(2)

    expect(ethersUtils.toWei('1000', 'ether')).toEqual(
      utils.bigNumberify('1000000000000000000000')
    )

    expect(ethersUtils.toWei('1000000000000', 'gwei')).toEqual(
      utils.bigNumberify('1000000000000000000000')
    )
  })

  it('hexToNumberString', () => {
    expect.assertions(2)

    const bigNumber = 132654781356418

    expect(ethersUtils.hexToNumberString('0x00')).toBe('0')
    expect(ethersUtils.hexToNumberString('0x' + bigNumber.toString(16))).toBe(
      `${bigNumber}`
    )
  })

  it('fromWei', () => {
    expect.assertions(2)

    expect(ethersUtils.fromWei('1000000000000000000000', 'ether')).toEqual(
      '1000'
    )

    expect(ethersUtils.fromWei('1000000000000000000000', 'gwei')).toEqual(
      '1000000000000'
    )
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
    expect(ethersUtils.toNumber(utils.bigNumberify('0x12355'))).toBe(74581)
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

    expect(ethersUtils.toRpcResultNumber(utils.bigNumberify('0x12345'))).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000012345'
    )
  })

  it('utf8ToHex', () => {
    expect.assertions(2)

    expect(ethersUtils.utf8ToHex('hi there')).toBe('0x6869207468657265')
    expect(ethersUtils.utf8ToHex('I like turtles')).toBe(
      '0x49206c696b6520747572746c6573'
    )
  })
})
