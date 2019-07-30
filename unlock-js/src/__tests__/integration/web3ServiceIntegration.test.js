import nock from 'nock'
import Web3Service from '../../web3Service'

describe('Web3 Service Integration', () => {
  let web3Service
  beforeAll(() => {
    nock.enableNetConnect()

    web3Service = new Web3Service({
      readOnlyProvider: 'http://ganache-integration::8545',
      unlockAddress: '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b',
      blockTime: 2,
      requiredConfirmations: 3,
    })
  })

  describe('generateLockAddress', () => {
    it('returns the next expected Lock Address', async () => {
      expect.assertions(1)

      expect(await web3Service.generateLockAddress()).toEqual(
        '0x8E7Ed961eF591C664c81bF72180A023b76eC03E1'
      )
    })
  })

  describe('refreshAccountBalance', () => {
    // this method needs to be cleaned of for consistency
    it('returns the balance of the account', async () => {
      expect.assertions(1)
      expect(
        await web3Service.refreshAccountBalance({
          address: '0xef49773e0d59f607cea8c8be4ce87bd26fd8e208',
        })
      ).toEqual('100')
    })
  })

  describe('getLock', () => {
    it('returns the Lock', async () => {
      expect.assertions(1)

      expect(
        await web3Service.getLock('0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267')
      ).toEqual({
        asOf: expect.any(Number),
        balance: '0',
        currencyContractAddress: null,
        expirationDuration: 300,
        keyPrice: '0.01',
        maxNumberOfKeys: -1,
        name: 'Ether Lock',
        outstandingKeys: 0,
        owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        publicLockVersion: 4,
      })
    })
  })

  describe('getPastLockCreationsTransactionsForUser', () => {
    // not quite sure if this makes sense
    it('returns lock creation transactions', async () => {
      expect.assertions(1)
      expect(
        await web3Service.getPastLockCreationsTransactionsForUser(
          '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
        )
      ).toEqual([])
    })
  })
})
