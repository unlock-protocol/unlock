import injectDefaultBalance from '../../utils/injectDefaultBalance'
import { DEFAULT_STABLECOIN_BALANCE } from '../../constants'

describe('injectDefaultBalance helper', () => {
  const erc20ContractAddress = '0xdeadbeef'
  it('should return empty object given an empty object', () => {
    expect.assertions(1)
    expect(injectDefaultBalance({}, erc20ContractAddress)).toEqual({})
  })

  it('should zero out eth', () => {
    expect.assertions(1)
    const balance = {
      eth: '123.4',
    }
    const expectedBalance = {
      eth: '0',
    }
    expect(injectDefaultBalance(balance, erc20ContractAddress)).toEqual(
      expectedBalance
    )
  })

  it('should update balances for the managed purchase stablecoin address with the default', () => {
    expect.assertions(1)
    const balance = {
      eth: '123.4',
      '0x123abc': '0',
      '0xdeadbeef': '0',
    }
    expect(injectDefaultBalance(balance, erc20ContractAddress)).toEqual({
      eth: '0',
      '0x123abc': '0',
      '0xdeadbeef': DEFAULT_STABLECOIN_BALANCE,
    })
  })
})
