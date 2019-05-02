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
})
