import Web3Service from '../../web3Service'
import { waitForContractDeployed } from '../helpers/waitForContractDeployed'
// NOTE: these addresses may change based on the setup of ganache.
// Ideally, rather than test with them, we should deploy the corresponding
// contracts so that we do not depend on external state.
const erc20Address = '0x3f8173047fba481a4d620032be6b39db0b4ab852'
const lockAddress = '0x5a9C58baB536Fc8C3C836916ba3dBD19E51c1923'
const unlockAddress = '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93'

jest.setTimeout(300000)

describe('Web3 Service Integration', () => {
  let web3Service
  beforeAll(async () => {
    let provider = process.env.CI
      ? 'http://ganache-integration:8545'
      : 'http://127.0.0.1:8545'

    web3Service = new Web3Service({
      readOnlyProvider: provider,
      unlockAddress,
      blockTime: 2,
      requiredConfirmations: 3,
    })

    // Let's wait for an OpCode at all of the addresses!
    const addresses = [erc20Address, lockAddress, unlockAddress]
    const promises = addresses.map(async address => {
      return await waitForContractDeployed(web3Service.provider, address)
    })
    await Promise.all(promises)
  })

  describe('generateLockAddress', () => {
    it('returns the next expected Lock Address', async () => {
      expect.assertions(1)

      // Is this always going to be the case?
      // I guess it depends on the order in which tests are run.
      expect(
        await web3Service.generateLockAddress(
          '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          {
            name: 'My Lock',
          }
        )
      ).toEqual('0x192DF9D24D7adB4E703760cD59C9024C649E9B6c')
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

      expect(await web3Service.getLock(lockAddress)).toEqual({
        asOf: expect.any(Number),
        balance: '0',
        currencyContractAddress: null,
        expirationDuration: 300,
        keyPrice: '0.01',
        maxNumberOfKeys: -1,
        name: 'ETH Lock',
        outstandingKeys: 0,
        owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        publicLockVersion: 5,
      })
    })
  })

  describe('getPastLockCreationsTransactionsForUser', () => {
    // not quite sure if this makes sense
    it('returns lock creation transactions', async () => {
      expect.assertions(1)
      expect(
        await web3Service.getPastLockCreationsTransactionsForUser(
          '0x3CA206264762Caf81a8F0A843bbB850987B41e16'
        )
      ).toEqual([])
    })
  })

  describe('getTokenSymbol', () => {
    it('returns a promise that resolves to the ERC20 symbol', async () => {
      expect.assertions(1)
      const symbol = await web3Service.getTokenSymbol(erc20Address)

      expect(symbol).toBe('TT')
    })

    it('emits an event mapping the contract address to the ERC20 symbol', async () => {
      expect.assertions(2)
      const contractAddress = erc20Address

      web3Service.on('token.update', (receivedContractAddress, update) => {
        expect(receivedContractAddress).toBe(contractAddress)
        expect(update).toEqual({
          symbol: 'TT',
        })
      })

      await web3Service.getTokenSymbol(contractAddress)
    })
  })

  describe('getTokenBalance', () => {
    it('returns a promise that resolves to the balance', async () => {
      expect.assertions(1)
      const balance = await web3Service.getTokenBalance(
        erc20Address,
        '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
      )

      expect(balance).toBe('500')
    })

    it('emits an error when balance cannot be retrieved', async () => {
      expect.assertions(1)
      web3Service.on('error', e => {
        expect(e.message).toEqual(
          expect.stringContaining('contract not deployed')
        )
      })

      await web3Service.getTokenBalance(
        '0xffffffffffffffffffffffffffffffffffffffff',
        '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
      )
    })
  })
})
