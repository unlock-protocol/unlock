const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const getProxy = require('../../helpers/proxy')

let unlock
let lock
let txObj
let event
let baseTokenURI
let uri
let lowerCaseAddress

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

contract('Lock / erc721 / tokenURI', accounts => {
  before(async () => {
    unlock = await getProxy(unlockContract)

    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST
  })

  describe('the global tokenURI stored in Unlock', () => {
    it('should return the global base token URI', async () => {
      assert.equal(await unlock.globalBaseTokenURI.call(), '')
    })

    describe('set global base URI', () => {
      beforeEach(async () => {
        txObj = await unlock.configUnlock(
          await unlock.globalTokenSymbol(),
          'https://newTokenURI.com/api/key/',
          {
            from: accounts[0],
          }
        )
        event = txObj.logs[0]
      })

      it('should allow the owner to set the global base token URI', async () => {
        assert.equal(
          await unlock.globalBaseTokenURI.call(),
          'https://newTokenURI.com/api/key/'
        )
      })

      it('getGlobalBaseTokenURI is the same', async () => {
        assert.equal(
          await unlock.globalBaseTokenURI.call(),
          await unlock.getGlobalBaseTokenURI.call()
        )
      })

      it('should emit the ConfigUnlock event', async () => {
        assert.equal(event.event, 'ConfigUnlock')
      })
    })

    it('should fail if someone other than the owner tries to set the URI', async () => {
      await reverts(
        unlock.configUnlock(
          await unlock.globalTokenSymbol(),
          'https://fakeURI.com',
          {
            from: accounts[1],
          }
        )
      )
    })
  })

  describe(' The custom tokenURI stored in the Lock', () => {
    it('should allow the lock creator to set a custom base tokenURI', async () => {
      txObj = await lock.setBaseTokenURI('https:/newURI.com/api/key/', {
        from: accounts[0],
      })
      event = txObj.logs[0]

      await lock.purchase(0, accounts[0], web3.utils.padLeft(0, 40), [], {
        value: web3.utils.toWei('0.01', 'ether'),
      })
      uri = await lock.tokenURI.call(1)
      const lockAddressStr = lock.address.toString()
      lowerCaseAddress = stringShifter(lockAddressStr)
      assert.equal(uri, `https:/newURI.com/api/key/${lowerCaseAddress}` + '/1')
    })

    it('should let anyone get the baseTokenURI for a lock', async () => {
      baseTokenURI = await lock.baseTokenURI.call()
      // should be the same as the previously set URI
      assert.equal(baseTokenURI, 'https:/newURI.com/api/key/')
    })

    it('should allow the lock creator to to unset the custom URI and default to the global one', async () => {
      await lock.setBaseTokenURI('', {
        from: accounts[0],
      })
      baseTokenURI = await lock.baseTokenURI.call()
      assert.equal(baseTokenURI, '')
      uri = await lock.tokenURI.call(1)
      assert.equal(
        uri,
        `https://newTokenURI.com/api/key/${lowerCaseAddress}` + '/1'
      )
    })

    it('should fail if someone other than the owner tries to set the URI', async () => {
      await reverts(
        lock.setBaseTokenURI('https://fakeURI.com', {
          from: accounts[1],
        }),
        'MixinLockManager: caller does not have the LockManager role'
      )
    })
  })
})
