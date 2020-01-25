import injectDefaultBalance from '../../utils/injectDefaultBalance'
import { DEFAULT_STABLECOIN_BALANCE } from '../../constants'

describe('injectDefaultBalance helper', () => {
  it('should return empty object given an empty object', () => {
    expect.assertions(1)
    expect(injectDefaultBalance({})).toEqual({})
  })

  it('should zero out eth', () => {
    expect.assertions(1)
    const balance = {
      eth: '123.4',
    }
    const expectedBalance = {
      eth: '0',
    }
    expect(injectDefaultBalance(balance)).toEqual(expectedBalance)
  })

  it('should update balances for the managed purchase stablecoin address with the default', () => {
    expect.assertions(1)

    const balance = {
      eth: '123.4',
      '0x123abc': '0',
      '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': '0', // SAI
      '0x6b175474e89094c44da98b954eedeac495271d0f': '0', // DAI
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0', // USDC
      '0xaFF4481D10270F50f203E0763e2597776068CBc5': '0', // WEENUS
    }
    expect(injectDefaultBalance(balance)).toEqual({
      eth: '0',
      '0x123abc': '0',
      '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': DEFAULT_STABLECOIN_BALANCE,
      '0x6b175474e89094c44da98b954eedeac495271d0f': DEFAULT_STABLECOIN_BALANCE,
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': DEFAULT_STABLECOIN_BALANCE,
      '0xaFF4481D10270F50f203E0763e2597776068CBc5': DEFAULT_STABLECOIN_BALANCE,
    })
  })
})
