import v0 from 'unlock-abi-0'
import v01 from 'unlock-abi-0-1'
import v02 from 'unlock-abi-0-2'
import v10 from 'unlock-abi-1-0'
import v11 from 'unlock-abi-1-1'
import deploy from '../../deploy'
import WalletService from '../../walletService'
import Web3Service from '../../web3Service'
import locks from '../helpers/fixtures/locks'

const abis = require('../../abis').default

let host,
  port = 8545
if (process.env.CI) {
  host = 'ganache-integration'
} else {
  host = '127.0.0.1'
}

let provider = `http://${host}:${port}`

// This test suite will do the following:
// For each version of the Unlock contract
// 1. Deploy it
// - createLock
// 2. For each lock version, check that all walletService functions are working as expected!
// - updateKeyPrice
// - purchaseKey
// - withdrawFromLock

// Increasing timeouts
jest.setTimeout(15000)

// I wish we did not have to do this manually!
const versionMappings = { v0: v0, v01: v01, v02: v02, v10: v10, v11: v11 }

// Tests
describe('Wallet Service Integration', () => {
  const versions = Object.keys(abis)
  describe.each(versions)('%s', versionName => {
    let walletService, web3Service

    beforeAll(async () => {
      const initialization = await deploy(
        host,
        port,
        versionMappings[versionName].Unlock
      )
      walletService = new WalletService({
        unlockAddress: initialization.to,
      })
      web3Service = new Web3Service({
        readOnlyProvider: provider,
        unlockAddress: initialization.to,
        requiredConfirmations: 2,
      })

      await walletService.connect(provider)
    })

    it('should yield true to isUnlockContractDeployed', done => {
      expect.assertions(2)
      walletService.isUnlockContractDeployed((error, deployed) => {
        expect(error).toBeNull()
        expect(deployed).toBe(true)
        done()
      })
    })

    it('should return the right version for unlockContractAbiVersion', async () => {
      expect.assertions(1)
      const abiVersion = await walletService.unlockContractAbiVersion()
      expect(abiVersion.version).toEqual(versionName)
    })

    describe.each(
      locks[versionName].map((lock, index) => [index, lock.name, lock])
    )('lock %i: %s', (lockIndex, lockName, lockParams) => {
      let lock, lockAddress

      beforeAll(async () => {
        lockAddress = await walletService.createLock(lockParams)
        lock = await web3Service.getLock(lockAddress)
      })

      it('should have deployed the right lock version', async () => {
        expect.assertions(1)
        const lockVersion = await web3Service.lockContractAbiVersion(
          lockAddress
        )
        expect(lockVersion.version).toEqual(versionName)
      })

      it('should have deployed the right lock name', () => {
        expect.assertions(1)
        expect(lock.name).toEqual(lockParams.name)
      })

      it('should have deployed the right lock maxNumberOfKeys', () => {
        expect.assertions(1)
        expect(lock.maxNumberOfKeys).toEqual(lockParams.maxNumberOfKeys)
      })

      it('should have deployed the right lock keyPrice', () => {
        expect.assertions(1)
        expect(lock.keyPrice).toEqual(lockParams.keyPrice)
      })

      it('should have deployed the right lock expirationDuration', () => {
        expect.assertions(1)
        expect(lock.expirationDuration).toEqual(lockParams.expirationDuration)
      })

      it('should have deployed the right currency', () => {
        expect.assertions(1)
        expect(lock.currencyContractAddress).toEqual(
          lockParams.currencyContractAddress
        )
      })

      describe('updateKeyPrice', () => {
        let oldKeyPrice, newPrice
        beforeAll(async () => {
          oldKeyPrice = lock.keyPrice
          newPrice = await walletService.updateKeyPrice({
            lockAddress: lockAddress,
            keyPrice: (parseFloat(oldKeyPrice) * 2).toString(),
          })
          lock = await web3Service.getLock(lockAddress)
        })

        it('should have changed the keyPrice', () => {
          expect.assertions(2)
          expect(newPrice).toEqual((parseFloat(oldKeyPrice) * 2).toString())
          expect(lock.keyPrice).toEqual(newPrice)
        })
      })

      describe('purchaseKey', () => {
        let tokenId
        let key
        let keyOwner, keyPurchaser
        let lockBalanceBefore
        let userBalanceBefore

        beforeAll(async () => {
          const accounts = await walletService.provider.listAccounts()
          keyPurchaser = accounts[0] // This is the default in walletService
          keyOwner = accounts[5]
          if (lock.currencyContractAddress === null) {
            // Get the ether balance of the lock before the purchase
            lockBalanceBefore = await web3Service.getAddressBalance(lockAddress)
            // Get the ether balance of the user before the purchase
            userBalanceBefore = await web3Service.getAddressBalance(
              keyPurchaser
            )
          } else {
            // Get the erc20 balance of the lock before the purchase
            lockBalanceBefore = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lockAddress
            )
            // Get the erc20 balance of the user before the purchase
            userBalanceBefore = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              keyPurchaser
            )
          }

          // No need to go further if the purchaser does not have enough to make key purchases
          // Make sure the account[0] (used by default by walletService) has enough Ether or ERC20
          if (parseFloat(userBalanceBefore) < parseFloat(lock.keyPrice)) {
            throw new Error(
              `Key purchaser ${keyPurchaser} does not have enough funds to perform key purchase on ${lockAddress}. Aborting tests.`
            )
          }

          tokenId = await walletService.purchaseKey({
            lockAddress,
            owner: keyOwner,
            keyPrice: lock.keyPrice,
          })
          key = await web3Service.getKeyByLockForOwner(lockAddress, keyOwner)
        })

        it('should yield the tokenId', () => {
          expect.assertions(1)
          expect(tokenId).not.toBe(null) // We don't know very much beyond the fact that it is not null
        })

        it('should have increased the currency balance on the lock', async () => {
          expect.assertions(1)
          let newBalance
          if (lock.currencyContractAddress === null) {
            newBalance = await web3Service.getAddressBalance(lockAddress)
          } else {
            newBalance = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lockAddress
            )
          }
          expect(parseFloat(newBalance)).toEqual(
            parseFloat(lockBalanceBefore) + parseFloat(lock.keyPrice)
          )
        })

        it('should have decreased the currency balance of the person making the purchase', async () => {
          expect.assertions(1)
          let newBalance
          if (lock.currencyContractAddress === null) {
            newBalance = await web3Service.getAddressBalance(keyPurchaser)
          } else {
            newBalance = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              keyPurchaser,
              web3Service.provider
            )
          }

          if (lock.currencyContractAddress === null) {
            // For Ether we need to account for gas
            expect(parseFloat(newBalance)).toBeLessThan(
              parseFloat(userBalanceBefore) - parseFloat(lock.keyPrice)
            )
          } else {
            // For ERC20 the balance should be exact
            expect(parseFloat(newBalance)).toBe(
              parseFloat(userBalanceBefore) - parseFloat(lock.keyPrice)
            )
          }
        })

        it('should have assigned the key to the right user', async () => {
          expect.assertions(1)
          expect(key.owner).toEqual(keyOwner)
        })

        it('should have assigned the key to the right lock', async () => {
          expect.assertions(1)
          expect(key.lock).toEqual(lockAddress)
        })

        it('should have set the right duration on the key', () => {
          expect.assertions(1)
          // the actual expiration depends on mining time (which we do not control)
          // We round to the minute!
          expect(
            parseInt(key.expiration) -
              parseInt(lock.expirationDuration + new Date().getTime() / 1000)
          ).toBeLessThan(60)
        })
      })

      describe('withdrawFromLock', () => {})
    })
  })
})
