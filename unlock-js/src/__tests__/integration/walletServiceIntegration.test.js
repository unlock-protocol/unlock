import WalletService from '../../walletService'
import Web3Service from '../../web3Service'
import locks from '../helpers/fixtures/locks'
import { waitForContractDeployed } from '../helpers/waitForContractDeployed'
import 'cross-fetch/polyfill'

let host
const port = 8545
// if (process.env.CI) {
host = 'ganache-integration'
// } else {
// host = '127.0.0.1'
// }

const provider = `http://${host}:${port}`

// This test suite will do the following:
// For each version of the Unlock contract
// 1. Deploy it
// - createLock
// 2. For each lock version, check that all walletService functions are working as expected!
// - updateKeyPrice
// - purchaseKey
// - withdrawFromLock

// Increasing timeouts
jest.setTimeout(300000)

let accounts

// Tests
describe('Wallet Service Integration', () => {
  const versions = ['v0', 'v01', 'v02', 'v10', 'v11', 'v12', 'v13', 'v7']
  describe.each(versions)('%s', versionName => {
    let walletService
    let web3Service

    beforeAll(async () => {
      walletService = new WalletService({})

      await walletService.connect(provider)

      await walletService.deployUnlock(versionName)

      web3Service = new Web3Service({
        readOnlyProvider: provider,
        unlockAddress: walletService.unlockContractAddress,
        requiredConfirmations: 2,
      })

      accounts = await walletService.provider.listAccounts()
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

    if (['v0', 'v01', 'v02', 'v10', 'v11'].indexOf(versionName) === -1) {
      let publicLockTemplateAddress

      describe('Configuration', () => {
        it('should be able to deploy the lock contract template', async () => {
          expect.assertions(2)
          publicLockTemplateAddress = await walletService.deployTemplate(
            versionName,
            (error, hash) => {
              expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/)
            }
          )
          expect(publicLockTemplateAddress).toMatch(/^0x[0-9a-fA-F]{40}$/)
        })

        it('should configure the unlock contract with the template, the token symbol and base URL', async () => {
          expect.assertions(2)
          let transactionHash
          const receipt = await walletService.configureUnlock(
            publicLockTemplateAddress,
            'TESTK',
            'https://locksmith.unlock-protocol.com/api/key/',
            (error, hash) => {
              transactionHash = hash
            }
          )
          expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
          expect(receipt.transactionHash).toEqual(transactionHash)
        })
      })
    }

    if (locks[versionName].length) {
      describe.each(
        locks[versionName].map((lock, index) => [index, lock.name, lock])
      )('lock %i: %s', (lockIndex, lockName, lockParams) => {
        let lock
        let expectedLockAddress
        let lockAddress
        let lockCreationHash

        beforeAll(async () => {
          if (lockParams.currencyContractAddress) {
            // Let's wait for erc20Address to be deployed
            await waitForContractDeployed(
              web3Service.provider,
              lockParams.currencyContractAddress
            )
          }

          expectedLockAddress = await web3Service.generateLockAddress(
            accounts[0],
            lockParams
          )

          lockAddress = await walletService.createLock(
            lockParams,
            (error, hash) => {
              lockCreationHash = hash
            }
          )
          lock = await web3Service.getLock(lockAddress)
        })

        it('should have yielded a transaction hash', () => {
          expect.assertions(1)
          expect(lockCreationHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
        })

        it('should have deployed a lock at the expected address', async () => {
          expect.assertions(1)
          expect(lockAddress).toEqual(expectedLockAddress)
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

        it('should have set the creator as a lock manager', async () => {
          expect.assertions(1)
          const isLockManager = await web3Service.isLockManager(
            lockAddress,
            accounts[0]
          )
          expect(isLockManager).toBe(true)
        })

        it('should have deployed a lock to the right beneficiary', () => {
          expect.assertions(1)
          expect(lock.beneficiary).toEqual(accounts[0]) // This is the default in walletService
        })

        describe('updateKeyPrice', () => {
          let oldKeyPrice
          let newPrice
          let transactionHash
          beforeAll(async () => {
            oldKeyPrice = lock.keyPrice
            newPrice = await walletService.updateKeyPrice(
              {
                lockAddress,
                keyPrice: (parseFloat(oldKeyPrice) * 2).toString(),
              },
              (error, hash) => {
                transactionHash = hash
              }
            )
            lock = await web3Service.getLock(lockAddress)
          })

          it('should have yielded a transaction hash', () => {
            expect.assertions(1)
            expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
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
          let keyOwner
          let keyPurchaser
          let lockBalanceBefore
          let userBalanceBefore
          let transactionHash

          beforeAll(async () => {
            keyPurchaser = accounts[0] // This is the default in walletService
            keyOwner = accounts[5]
            if (lock.currencyContractAddress === null) {
              // Get the ether balance of the lock before the purchase
              lockBalanceBefore = await web3Service.getAddressBalance(
                lockAddress
              )
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

            tokenId = await walletService.purchaseKey(
              {
                lockAddress,
                owner: keyOwner,
                keyPrice: lock.keyPrice,
              },
              (error, hash) => {
                transactionHash = hash
              }
            )
            key = await web3Service.getKeyByLockForOwner(lockAddress, keyOwner)
          })

          it('should have yielded a transaction hash', () => {
            expect.assertions(1)
            expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
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

        describe('withdrawFromLock', () => {
          let lockBalanceBefore
          let userBalanceBefore
          let withdrawnAmount
          let transactionHash
          // TODO: support partial withdraws
          // TODO: get the beneficiary address from the lock

          beforeAll(async () => {
            if (lock.currencyContractAddress === null) {
              // Get the ether balance of the lock before the withdrawal
              lockBalanceBefore = await web3Service.getAddressBalance(
                lockAddress
              )
              // Get the ether balance of the beneficiary before the withdrawal
              userBalanceBefore = await web3Service.getAddressBalance(
                lock.beneficiary
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
                lock.beneficiary
              )
            }

            withdrawnAmount = await walletService.withdrawFromLock(
              {
                lockAddress,
              },
              (error, hash) => {
                transactionHash = hash
              }
            )
          })

          it('should have yielded a transaction hash', () => {
            expect.assertions(1)
            expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
          })

          it('should have withdrawn an non null amount', () => {
            expect.assertions(1)
            expect(withdrawnAmount).toEqual(lockBalanceBefore)
          })

          it('should decrease the balance by the withdrawn amount', async () => {
            expect.assertions(1)
            let lockBalanceAfter
            if (lock.currencyContractAddress === null) {
              // Get the ether balance of the lock before the withdrawal
              lockBalanceAfter = await web3Service.getAddressBalance(
                lockAddress
              )
            } else {
              // Get the erc20 balance of the lock before the purchase
              lockBalanceAfter = await web3Service.getTokenBalance(
                lock.currencyContractAddress,
                lockAddress
              )
            }
            expect(parseFloat(lockBalanceAfter)).toEqual(
              parseFloat(lockBalanceBefore) - parseFloat(withdrawnAmount)
            )
          })

          it('should increase the balance of the beneficiary', async () => {
            expect.assertions(1)
            let beneficiaryBalanceAfter
            if (lock.currencyContractAddress === null) {
              // Get the ether balance of the beneficiary before the withdrawal
              beneficiaryBalanceAfter = await web3Service.getAddressBalance(
                lock.beneficiary
              )
              // We should take gas paid into account... so the amount is larger than before
              // but smaller than the sum of the previous balance and the amount in the lock
              expect(parseFloat(beneficiaryBalanceAfter)).toBeGreaterThan(
                parseFloat(userBalanceBefore)
              )
            } else {
              // Get the erc20 balance of the user before the purchase
              beneficiaryBalanceAfter = await web3Service.getTokenBalance(
                lock.currencyContractAddress,
                lock.beneficiary
              )
              expect(parseFloat(beneficiaryBalanceAfter)).toEqual(
                parseFloat(userBalanceBefore) + parseFloat(withdrawnAmount)
              )
            }
          })
        })
      })
    }
  })
})
