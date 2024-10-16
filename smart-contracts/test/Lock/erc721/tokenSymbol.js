const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const { reverts, deployLock, deployContracts } = require('../../helpers')
const metadata = require('../../fixtures/metadata')

let lock
let unlock
let lockManager, someAccount

describe('Lock / erc721 / tokenSymbol', () => {
  before(async () => {
    ;[lockManager, someAccount] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
  })

  describe('the global token symbol stored in Unlock', () => {
    it('should return the global token symbol', async () => {
      assert.equal(await unlock.globalTokenSymbol(), '')
    })

    describe('set the global symbol', () => {
      beforeEach(async () => {
        await unlock.connect(lockManager).configUnlock(
          await unlock.governanceToken(),
          await unlock.weth(),
          0,
          'KEY',
          await unlock.globalBaseTokenURI(),
          1 // mainnet
        )
      })

      it('should allow the owner to set the global token Symbol', async () => {
        assert.equal(await unlock.globalTokenSymbol(), 'KEY')
      })

      it('getGlobalTokenSymbol is the same', async () => {
        assert.equal(
          await unlock.globalTokenSymbol(),
          await unlock.getGlobalTokenSymbol()
        )
      })
    })

    it('should fail if someone other than the owner tries to set the symbol', async () => {
      await reverts(
        unlock.connect(someAccount).configUnlock(
          await unlock.governanceToken(),
          await unlock.weth(),
          0,
          'BTC',
          await unlock.globalBaseTokenURI(),
          1 // mainnet
        )
      )
    })
  })

  describe('A custom token symbol stored in the lock', () => {
    it('should allow the lock owner to set a custom token symbol', async () => {
      await lock
        .connect(lockManager)
        .setLockMetadata(...Object.values(metadata))
      assert.equal(await lock.symbol(), metadata.symbol)
    })

    it('should emit the NewLockConfig event', async () => {
      const tx = await lock.setLockMetadata(...Object.values(metadata))
      const receipt = await tx.wait()
      const event = await getEvent(receipt, 'LockMetadata')
      assert.equal(event.args.symbol, metadata.symbol)
    })

    it('should fail if someone other than the owner tries to set the symbol', async () => {
      await reverts(
        lock.connect(someAccount).setLockMetadata(...Object.values(metadata)),
        'ONLY_LOCK_MANAGER'
      )
    })
  })
})
