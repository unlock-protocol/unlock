const { protocols, tokens } = require('hardlydifficult-ethereum-contracts')

const KeyPurchaserFactory = artifacts.require('KeyPurchaserFactory.sol')
const KeyPurchaser = artifacts.require('KeyPurchaser.sol')
const { reverts } = require('truffle-assertions')

contract('keyPurchaserFactory', accounts => {
  const [endUser, lockCreator, tokenMinter, otherAccount] = accounts
  let dai
  let lock
  let factory
  // Since dai also uses 18 decimals, this represents 1 DAI
  const keyPrice = web3.utils.toWei('1', 'ether')

  beforeEach(async () => {
    dai = await tokens.dai.deploy(web3, tokenMinter)
    await dai.mint(endUser, web3.utils.toWei('100', 'ether'), {
      from: tokenMinter,
    })
    // Anyone could deploy the factory, and then front ends can integrate with one they trust.
    factory = await KeyPurchaserFactory.new()

    // Create a Lock priced in DAI
    lock = await protocols.unlock.createTestLock(web3, {
      tokenAddress: dai.address,
      keyPrice,
      expirationDuration: 30, // 30 seconds
      from: lockCreator,
    })
  })

  it('non-lock manager cannot make a purchaser via the factory', async () => {
    await reverts(
      factory.deployKeyPurchaser(lock.address, keyPrice, 42, 99, 0, {
        from: otherAccount,
      }),
      'ONLY_LOCK_MANAGER'
    )
  })

  describe('on creation', () => {
    let purchaser

    beforeEach(async () => {
      const tx = await factory.deployKeyPurchaser(
        lock.address,
        keyPrice,
        42,
        99,
        1,
        {
          from: lockCreator,
        }
      )
      purchaser = await KeyPurchaser.at(tx.receipt.logs[0].args.keyPurchaser)
    })

    it('purchaser created with the correct settings', async () => {
      const maxPurchasePrice = await purchaser.maxPurchasePrice()
      const renewWindow = await purchaser.renewWindow()
      const renewMinFrequency = await purchaser.renewMinFrequency()
      const msgSenderReward = await purchaser.msgSenderReward()
      assert.equal(maxPurchasePrice, keyPrice)
      assert.equal(renewWindow, 42)
      assert.equal(renewMinFrequency, 99)
      assert.equal(msgSenderReward, 1)
    })

    it('can read the purchaser address from the factory', async () => {
      const purchasers = await factory.getKeyPurchasers(lock.address)
      assert.equal(purchasers.length, 1)
      assert.equal(purchasers[0], purchaser.address)
    })

    it('the purchaser has the expected address', async () => {
      const maxPurchasePrice = await purchaser.maxPurchasePrice()
      const renewWindow = await purchaser.renewWindow()
      const renewMinFrequency = await purchaser.renewMinFrequency()
      const msgSenderReward = await purchaser.msgSenderReward()
      const expectedAddress = await factory.getExpectedAddress(
        lock.address,
        maxPurchasePrice,
        renewWindow,
        renewMinFrequency,
        msgSenderReward
      )
      assert.equal(expectedAddress, purchaser.address)
    })

    it('can read the purchaser address by index from the factory', async () => {
      const _purchaser = await factory.lockToKeyPurchasers(lock.address, 0)
      assert.equal(_purchaser, purchaser.address)
    })

    it('can read the purchaser count from the factory', async () => {
      const purchaserCount = await factory.getKeyPurchaserCount(lock.address)
      assert.equal(purchaserCount, 1)
    })

    describe('with many options', () => {
      // We can read options even if there's 1k options for a single lock
      // But lowering the test to 100 to save CI time
      const purchaserCount = 100

      beforeEach(async () => {
        for (let i = 0; i < purchaserCount - 1; i++) {
          // Note: the `+ i` is just to make each option different somehow
          await factory.deployKeyPurchaser(
            lock.address,
            keyPrice,
            50,
            99 + i,
            0,
            {
              from: lockCreator,
            }
          )
        }
      })

      it('can read the purchasers', async () => {
        const purchasers = await factory.getKeyPurchasers(lock.address)
        assert.equal(purchasers.length, purchaserCount)
        assert.equal(purchasers[0], purchaser.address) // sanity check
      })
    })
  })
})
