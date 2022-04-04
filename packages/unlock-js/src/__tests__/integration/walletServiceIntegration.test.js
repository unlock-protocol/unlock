import { ethers } from 'hardhat'
import WalletService from '../../walletService'
import Web3Service from '../../web3Service'
import locks from '../helpers/fixtures/locks'
import { deployUnlock, configureUnlock, deployTemplate } from '../helpers'
import { ZERO } from '../../constants'
import nodeSetup from '../setup/prepare-eth-node-for-unlock'
import UnlockVersions from '../../Unlock'

const chainId = 31337

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
const networks = {
  [chainId]: {
    provider: 'http://localhost:8545',
  },
}

// Unlock versions to test
const UnlockVersionNumbers = Object.keys(UnlockVersions).filter(
  (v) => v !== 'v6' // 'v6' is disabled it required erc1820
)

describe.each(UnlockVersionNumbers)('Unlock %s', (unlockVersion) => {
  let walletService
  let web3Service
  let ERC20Address

  // Unlock v4 can only interact w PublicLock v4
  const PublicLockVersions =
    unlockVersion === 'v4'
      ? ['v4']
      : Object.keys(locks).filter((v) => !['v4', 'v6'].includes(v))

  beforeAll(async () => {
    // deploy ERC20 and set balances
    ERC20Address = await nodeSetup()

    const [signer] = await ethers.getSigners()
    const ethersProvider = signer.provider

    // pass hardhat ethers provider
    networks[chainId].ethersProvider = ethersProvider

    // deploy Unlock
    const unlockAddress = await deployUnlock(unlockVersion)
    networks[chainId].unlockAddress = unlockAddress

    walletService = new WalletService(networks)

    await walletService.connect(ethersProvider, signer)
    web3Service = new Web3Service(networks)

    accounts = await walletService.provider.listAccounts()
  })

  it('should yield true to isUnlockContractDeployed', async () => {
    expect.assertions(1)
    expect(await walletService.isUnlockContractDeployed(chainId)).toBe(true)
  })

  it('should return the right version for unlockContractAbiVersion', async () => {
    expect.assertions(1)
    const abiVersion = await walletService.unlockContractAbiVersion()
    expect(abiVersion.version).toEqual(unlockVersion)
  })

  if (['v4'].indexOf(unlockVersion) === -1) {
    describe.each(PublicLockVersions)(
      'configuration using PublicLock %s',
      (publicLockVersion) => {
        let publicLockTemplateAddress
        it('should be able to deploy the lock contract template', async () => {
          expect.assertions(2)
          publicLockTemplateAddress = await deployTemplate(
            publicLockVersion,
            (error, hash) => {
              if (error) {
                throw error
              }
              expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/)
            }
          )
          expect(publicLockTemplateAddress).toMatch(/^0x[0-9a-fA-F]{40}$/)
        })

        it('should configure the unlock contract with the template, the token symbol and base URL', async () => {
          expect.assertions(2)
          let transactionHash
          const { unlockAddress } = walletService
          const receipt = await configureUnlock(
            unlockAddress,
            unlockVersion,
            {
              publicLockTemplateAddress,
              globalTokenSymbol: 'TESTK',
              globalBaseTokenURI:
                'https://locksmith.unlock-protocol.com/api/key/',
              unlockDiscountToken: ZERO,
              wrappedEth: ZERO,
              estimatedGasForPurchase: 0,
              chainId,
            },
            (error, hash) => {
              if (error) {
                throw error
              }
              transactionHash = hash
            }
          )
          expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
          expect(receipt.transactionHash).toEqual(transactionHash)
        })
      }
    )
  }

  describe.each(PublicLockVersions)('using Lock %s', (publicLockVersion) => {
    describe.each(
      locks[publicLockVersion].map((lock, index) => [index, lock.name, lock])
    )('lock %i: %s', (lockIndex, lockName, lockParams) => {
      let lock
      let expectedLockAddress
      let lockAddress
      let lockCreationHash

      beforeAll(async () => {
        if (publicLockVersion !== 'v4') {
          // here we need to setup unlock template properly
          const unlock = await walletService.getUnlockContract()

          // deploy the relevant template
          const templateAddress = await deployTemplate(publicLockVersion)

          if (['v10', 'v11'].indexOf(unlockVersion) > -1) {
            // prepare unlock for upgradeable locks
            const versionNumber = parseInt(publicLockVersion.replace('v', ''))
            await unlock.addLockTemplate(templateAddress, versionNumber)
          }

          // set the right template in Unlock
          const tx = await unlock.setLockTemplate(templateAddress)
          await tx.wait()
        }
        // parse erc20
        const { isERC20 } = lockParams
        lockParams.currencyContractAddress = isERC20 ? ERC20Address : null

        // unique Lock name to avoid conflicting addresses
        lockParams.name = `Unlock${unlockVersion} - Lock ${publicLockVersion} - ${lockParams.name}`

        expectedLockAddress = await web3Service.generateLockAddress(
          accounts[0],
          lockParams,
          chainId
        )

        lockAddress = await walletService.createLock(
          lockParams,
          (error, hash) => {
            if (error) {
              throw error
            }
            lockCreationHash = hash
          }
        )

        lock = await web3Service.getLock(lockAddress, chainId)
      })

      it('should have yielded a transaction hash', () => {
        expect.assertions(1)
        expect(lockCreationHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
      })

      if (['v4', 'v10', 'v11'].indexOf(unlockVersion) === -1) {
        it('should have deployed a lock at the expected address', async () => {
          expect.assertions(1)
          expect(lockAddress).toEqual(expectedLockAddress)
        })
      }

      it('should have deployed the right lock version', async () => {
        expect.assertions(1)
        const lockVersion = await web3Service.lockContractAbiVersion(
          lockAddress
        )
        expect(lockVersion.version).toEqual(publicLockVersion)
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
          accounts[0],
          chainId
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
              if (error) {
                throw error
              }
              transactionHash = hash
            }
          )
          lock = await web3Service.getLock(lockAddress, chainId)
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

      describe('grantKey', () => {
        let tokenId
        let key
        let keyBefore
        let keyGrantee
        let transactionHash
        beforeAll(async () => {
          keyGrantee = accounts[7]
          keyBefore = await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyGrantee,
            chainId
          )
          tokenId = await walletService.grantKey(
            {
              lockAddress,
              recipient: keyGrantee,
            },
            (error, hash) => {
              if (error) {
                throw error
              }
              transactionHash = hash
            }
          )
          key = await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyGrantee,
            chainId
          )
        })

        it('should not have a valid key before the transaction', () => {
          expect.assertions(2)
          expect(keyBefore.owner).toEqual(keyGrantee)
          expect(keyBefore.expiration).toEqual(0)
        })

        it('should have yielded a transaction hash', () => {
          expect.assertions(1)
          expect(transactionHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
        })

        it('should yield the tokenId', () => {
          expect.assertions(1)
          expect(tokenId).not.toBe(null) // We don't know very much beyond the fact that it is not null
        })

        it('should have assigned the key to the right user', async () => {
          expect.assertions(1)
          expect(key.owner).toEqual(keyGrantee)
        })

        it('should have assigned the key to the right lock', async () => {
          expect.assertions(1)
          expect(key.lock).toEqual(lockAddress)
        })

        it('should have set the right duration on the key', async () => {
          expect.assertions(1)
          const blockNumber = await walletService.provider.getBlockNumber()
          const latestBlock = await walletService.provider.getBlock(blockNumber)
          expect(
            Math.floor(key.expiration) -
            Math.floor(lock.expirationDuration + latestBlock.timestamp)
          ).toBeLessThan(60)
        })

        if (['v4', 'v6'].indexOf(publicLockVersion) == -1) {
          it('should have set the right keyManager', async () => {
            expect.assertions(1)
            const keyManager = await web3Service.keyManagerOf(
              lockAddress,
              key.tokenId,
              chainId
            )
            expect(keyManager).toBe(accounts[0])
          })
        }
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
              lockAddress,
              chainId
            )
            // Get the ether balance of the user before the purchase
            userBalanceBefore = await web3Service.getAddressBalance(
              keyPurchaser,
              chainId
            )
          } else {
            // Get the erc20 balance of the lock before the purchase
            lockBalanceBefore = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lockAddress,
              chainId
            )
            // Get the erc20 balance of the user before the purchase
            userBalanceBefore = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              keyPurchaser,
              chainId
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
              if (error) {
                throw error
              }
              transactionHash = hash
            }
          )
          key = await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyOwner,
            chainId
          )
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
            newBalance = await web3Service.getAddressBalance(
              lockAddress,
              chainId
            )
          } else {
            newBalance = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lockAddress,
              chainId
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
            newBalance = await web3Service.getAddressBalance(
              keyPurchaser,
              chainId
            )
          } else {
            newBalance = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              keyPurchaser,
              chainId
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
          expect.assertions(2)
          expect(key.owner).toEqual(keyOwner)
          const owner = await web3Service.ownerOf(key.lock, tokenId, chainId)
          expect(owner).toEqual(keyOwner)
        })

        it('should have assigned the key to the right lock', async () => {
          expect.assertions(1)
          expect(key.lock).toEqual(lockAddress)
        })

        it('should have set the right duration on the key', async () => {
          expect.assertions(1)
          const blockNumber = await walletService.provider.getBlockNumber()
          const latestBlock = await walletService.provider.getBlock(blockNumber)
          expect(
            Math.floor(key.expiration) -
            Math.floor(lock.expirationDuration + latestBlock.timestamp)
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
              lockAddress,
              chainId
            )
            // Get the ether balance of the beneficiary before the withdrawal
            userBalanceBefore = await web3Service.getAddressBalance(
              lock.beneficiary,
              chainId
            )
          } else {
            // Get the erc20 balance of the lock before the purchase
            lockBalanceBefore = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lockAddress,
              chainId
            )
            // Get the erc20 balance of the user before the purchase
            userBalanceBefore = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lock.beneficiary,
              chainId
            )
          }

          withdrawnAmount = await walletService.withdrawFromLock(
            {
              lockAddress,
            },
            (error, hash) => {
              if (error) {
                throw error
              }
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
              lockAddress,
              chainId
            )
          } else {
            // Get the erc20 balance of the lock before the purchase
            lockBalanceAfter = await web3Service.getTokenBalance(
              lock.currencyContractAddress,
              lockAddress,
              chainId
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
              lock.beneficiary,
              chainId
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
              lock.beneficiary,
              chainId
            )
            expect(parseFloat(beneficiaryBalanceAfter)).toEqual(
              parseFloat(userBalanceBefore) + parseFloat(withdrawnAmount)
            )
          }
        })
      })

      describe('cancelAndRefund', () => {
        let key
        let keyOwner

        beforeAll(async () => {
          keyOwner = accounts[0]
          await walletService.purchaseKey({
            lockAddress,
          })
          await new Promise((resolve) =>
            setTimeout(async () => {
              key = await web3Service.getKeyByLockForOwner(
                lockAddress,
                keyOwner,
                chainId
              )
              resolve()
            }, 5000)
          )
        })

        it('should have a key and allow the member to cancel it and get a refund', async () => {
          expect.assertions(2)
          expect(key.expiration > new Date().getTime() / 1000).toBe(true)
          await walletService.cancelAndRefund({
            lockAddress,
          })
          const afterCancellation = await web3Service.getKeyByLockForOwner(
            lockAddress,
            keyOwner,
            chainId
          )
          expect(afterCancellation.expiration < key.expiration).toBe(true)
        })
      })

      // Test only on lock v9 and above.
      if (['v9'].indexOf(publicLockVersion) !== -1) {
        describe('setMaxNumberOfKeys', () => {
          let oldMaxNumberOfKeys

          beforeAll(async () => {
            oldMaxNumberOfKeys = lock.maxNumberOfKeys
            await walletService.setMaxNumberOfKeys(
              {
                lockAddress,
                maxNumberOfKeys: parseFloat(200).toString(),
              },
              (error) => {
                if (error) {
                  throw error
                }
              }
            )
            lock = await web3Service.getLock(lockAddress, chainId)
          })

          it('Check if setMaxNumberOfKeys updated the maxNumberOfKeys', () => {
            expect.assertions(2)
            expect(oldMaxNumberOfKeys).not.toBe(lock.maxNumberOfKeys)
            expect(lock.maxNumberOfKeys).toBe(200)
          })
        })
        describe('setExpirationDuration', () => {
          let expirationDuration

          beforeAll(async () => {
            expirationDuration = lock.expirationDuration
            await walletService.setExpirationDuration(
              {
                lockAddress,
                expirationDuration: parseFloat(200).toString(),
              },
              (error) => {
                if (error) {
                  throw error
                }
              }
            )
            lock = await web3Service.getLock(lockAddress, chainId)
          })

          it('Check if setMaxNumberOfKeys updated the maxNumberOfKeys', () => {
            expect.assertions(2)
            expect(expirationDuration).not.toBe(lock.expirationDuration)
            expect(lock.expirationDuration).toBe(200)
          })
        })
      }

      if (['v4', 'v6'].indexOf(publicLockVersion) === -1) {
        const keyGranter = '0x8Bf9b48D4375848Fb4a0d0921c634C121E7A7fd0'
        describe('keyGranter', () => {
          it('should not have key granter role for random address', async () => {
            expect.assertions(1)
            const isKeyManager = await web3Service.isKeyGranter(
              lockAddress,
              keyGranter,
              chainId
            )
            expect(isKeyManager).toBe(false)
          })

          it('should be able to grant the keyManager role', async () => {
            expect.assertions(2)
            const hasGrantedKeyGranter = await walletService.addKeyGranter({
              lockAddress,
              keyGranter,
            })
            expect(hasGrantedKeyGranter).toBe(true)
            const isKeyManager = await web3Service.isKeyGranter(
              lockAddress,
              keyGranter,
              chainId
            )
            expect(isKeyManager).toBe(true)
          })
        })

        describe('expireAndRefundFor', () => {
          let keyOwner = '0x2f883401de65129fd1c368fe3cb26d001c4dc583'
          let expiration
          beforeAll(async () => {
            // First let's get a user to buy a membership
            await walletService.purchaseKey({
              lockAddress,
              owner: keyOwner,
            })
          })

          it('should have set an expiration for this member in the future', async () => {
            expect.assertions(1)
            const key = await web3Service.getKeyByLockForOwner(
              lockAddress,
              keyOwner,
              chainId
            )
            expiration = key.expiration

            expect(expiration).toBeGreaterThan(new Date().getTime() / 1000)
          })

          it('should expire the membership', async () => {
            expect.assertions(1)
            await walletService.expireAndRefundFor({
              lockAddress,
              keyOwner,
            })
            const key = await web3Service.getKeyByLockForOwner(
              lockAddress,
              keyOwner,
              chainId
            )

            expect(expiration).toBeGreaterThan(key.expiration)
          })
        })
      }

      if (['v4'].indexOf(publicLockVersion) == -1) {
        describe('shareKey', () => {
          it('should allow a member to share their key with another one', async () => {
            expect.assertions(4)
            const tokenId = await walletService.purchaseKey({
              lockAddress,
            })

            // Let's now get the duration for that key!
            const { expiration } = await web3Service.getKeyByLockForOwner(
              lockAddress,
              accounts[0],
              chainId
            )
            const now = Math.floor(new Date().getTime() / 1000)
            expect(expiration).toBeGreaterThan(now)

            const recipient = '0x6524dbb97462ac3919866b8fbb22bf181d1d4113'
            const recipientDurationBefore =
              await web3Service.getKeyExpirationByLockForOwner(
                lockAddress,
                recipient,
                chainId
              )

            expect(recipientDurationBefore).toBe(0)

            // Let's now share the key
            await walletService.shareKey({
              lockAddress,
              tokenId,
              recipient,
              duration: expiration - now, // share all of the time!
            })

            const newExpiration =
              await web3Service.getKeyExpirationByLockForOwner(
                lockAddress,
                accounts[0],
                chainId
              )

            expect(newExpiration).toBeLessThan(expiration)

            expect(
              await web3Service.getKeyExpirationByLockForOwner(
                lockAddress,
                recipient,
                chainId
              )
            ).toBeGreaterThan(recipientDurationBefore)
          })
        })
      }
    })
  })
})
