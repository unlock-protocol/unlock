const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const {
  deployLock,
  deployContracts,
  purchaseKey,
  reverts,
} = require('../../helpers')

const metadata = require('../../fixtures/metadata')
const defaultTokenURI = 'https://globalBaseTokenURI.com/api/key/'

let lock
let unlock
let baseTokenURI
let lockManager, someAccount

// Helper function to deal with the lock returning the address part of the URI in lowercase.
function stringShifter(str) {
  let lowercaseAddress = ''
  let c
  for (let i = 0; i < str.length; i++) {
    c = str.charAt(i)
    if (c.toLowerCase() != c.toUpperCase()) {
      lowercaseAddress += c.toLowerCase()
    } else {
      lowercaseAddress += c
    }
  }
  return lowercaseAddress
}

describe('Lock / erc721 / tokenURI', () => {
  before(async () => {
    ;[lockManager, someAccount] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
  })

  describe('the global tokenURI stored in Unlock', () => {
    it('should return the global base token URI', async () => {
      assert.equal(await unlock.globalBaseTokenURI(), '')
    })

    describe('set global base URI', () => {
      let configUnlockEvent
      beforeEach(async () => {
        const tx = await unlock.connect(lockManager).configUnlock(
          await unlock.governanceToken(),
          await unlock.weth(),
          0,
          await unlock.globalTokenSymbol(),
          defaultTokenURI,
          1 // mainnet
        )
        const receipt = await tx.wait()
        configUnlockEvent = await getEvent(receipt, 'ConfigUnlock')
      })

      it('should allow the owner to set the global base token URI', async () => {
        assert.equal(await unlock.globalBaseTokenURI(), defaultTokenURI)
      })

      it('getGlobalBaseTokenURI is the same', async () => {
        assert.equal(
          await unlock.globalBaseTokenURI(),
          await unlock.getGlobalBaseTokenURI()
        )
      })

      it('should emit the ConfigUnlock event', async () => {
        assert.equal(configUnlockEvent.args.globalTokenURI, defaultTokenURI)
      })
    })

    it('should fail if someone other than the owner tries to set the URI', async () => {
      await reverts(
        unlock.connect(someAccount).configUnlock(
          await unlock.governanceToken(),
          await unlock.weth(),
          0,
          await unlock.globalTokenSymbol(),
          'https://fakeGlobalURI.com',
          1 // mainnet
        )
      )
    })
  })

  describe(' The custom tokenURI stored in the Lock', () => {
    let lockMetadataEvent
    before(async () => {
      const tx = await lock
        .connect(lockManager)
        .setLockMetadata(...Object.values(metadata))
      const receipt = await tx.wait()
      lockMetadataEvent = await getEvent(receipt, 'LockMetadata')
    })

    it('should allow the lock creator to set a custom base tokenURI', async () => {
      await purchaseKey(lock, await lockManager.getAddress())
      const uri = await lock.tokenURI(1)
      assert.equal(uri, `${metadata.baseTokenURI}1`)
    })

    it('should emit the LockMetadata event', async () => {
      assert.equal(lockMetadataEvent.args.baseTokenURI, metadata.baseTokenURI)
    })

    it('should let anyone get the baseTokenURI for a lock by passing tokenId 0', async () => {
      // here we pass 0 as the tokenId to get the baseTokenURI
      baseTokenURI = await lock.tokenURI(0)
      assert.equal(baseTokenURI, metadata.baseTokenURI)
    })

    it('should allow the lock creator to unset the custom URI and default to the global one', async () => {
      await lock.connect(lockManager).setLockMetadata(
        metadata.name,
        metadata.symbol,
        '' //baseTokenURI
      )

      const baseTokenURI = await lock.tokenURI(0)
      const lockAddressStr = await lock.getAddress()
      const lowerCaseAddress = stringShifter(lockAddressStr)

      // should now return the globalBaseTokenURI + the lock address
      assert.equal(baseTokenURI, `${defaultTokenURI}${lowerCaseAddress}/`)

      const uri = await lock.tokenURI(1)
      assert.equal(uri, `${defaultTokenURI}${lowerCaseAddress}` + '/1')
    })
  })

  it('should fail if someone other than the owner tries to set the URI', async () => {
    await reverts(
      lock.connect(someAccount).setLockMetadata(...Object.values(metadata)),
      'ONLY_LOCK_MANAGER'
    )
  })
})
