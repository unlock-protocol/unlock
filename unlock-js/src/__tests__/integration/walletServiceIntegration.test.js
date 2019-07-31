import nock from 'nock'
import WalletService from '../../walletService'

describe('Wallet Service Integration', () => {
  let walletService
  let provider

  beforeAll(async () => {
    nock.enableNetConnect()

    provider = process.env.CI
      ? 'http://ganache-integration:8545'
      : 'http://127.0.0.1:8545'

    walletService = new WalletService({
      unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
    })

    await walletService.connect(provider)
  })

  afterAll(() => {
    nock.disableNetConnect()
  })

  describe('isUnlockContractDeployed', () => {
    it('returns the next expected Lock Address', async () => {
      expect.assertions(1)
      let contractAvailability = await walletService.isUnlockContractDeployed(
        (_, result) => {
          return result
        }
      )

      expect(contractAvailability).toEqual(true)
    })
  })

  describe('getAccount', () => {
    it('returns the current account', async () => {
      expect.assertions(1)
      let account = await walletService.getAccount()
      expect(account).toEqual('0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2')
    })
  })
})
