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

// Helper function to deal with the lock returning the address part of the URI in lowercase.
function lowerCase(str) {
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

contract('Lock / erc721 / tokenURI', (accounts) => {
  before(async () => {
    unlock = await getProxy(unlockContract)
  })

  describe('the global tokenURI stored in Unlock', () => {
    it('should return the global base token URI', async () => {
      assert.equal(await unlock.globalBaseTokenURI.call(), '')
    })

    describe('set global base URI', () => {
      beforeEach(async () => {
        txObj = await unlock.configUnlock(
          await unlock.udt(),
          await unlock.weth(),
          0,
          await unlock.globalTokenSymbol(),
          'https://globalBaseTokenURI.com/api/key/',
          1, // mainnet
          {
            from: accounts[0],
          }
        )
        event = txObj.logs[0]
      })

      it('should allow the owner to set the global base token URI', async () => {
        assert.equal(
          await unlock.globalBaseTokenURI.call(),
          'https://globalBaseTokenURI.com/api/key/'
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
          await unlock.udt(),
          await unlock.weth(),
          0,
          await unlock.globalTokenSymbol(),
          'https://fakeGlobalURI.com',
          1, // mainnet
          {
            from: accounts[1],
          }
        )
      )
    })
  })

  describe(' The custom tokenURI stored in the Lock', () => {
    beforeEach(async () => {
      // set in unlock
      await unlock.configUnlock(
        await unlock.udt(),
        await unlock.weth(),
        0,
        await unlock.globalTokenSymbol(),
        'https://default.com/api/key/',
        1, // mainnet
        {
          from: accounts[0],
        }
      )

      // deploy locks
      const locks = await deployLocks(unlock, accounts[0])
      lock = locks.FIRST
    })

    it('should set base tokenURI from Unlock as default', async () => {
      baseTokenURI = await lock.tokenURI.call(0)
      assert.equal(
        baseTokenURI,
        `https://default.com/api/key/${lowerCase(lock.address)}/`
      )
    })

    it('should allow the lock creator to set a custom base tokenURI', async () => {
      await lock.setBaseTokenURI('https:/customBaseTokenURI.com/api/key/', {
        from: accounts[0],
      })
      assert.equal(
        await lock.tokenURI.call(1),
        'https:/customBaseTokenURI.com/api/key/' + '1'
      )
      assert.equal(
        await lock.tokenURI.call(1234567890),
        'https:/customBaseTokenURI.com/api/key/' + '1234567890'
      )
    })

    it('should let anyone get the baseTokenURI for a lock by passing tokenId 0', async () => {
      // default URI
      assert.equal(
        await lock.tokenURI.call(0),
        `https://default.com/api/key/${lowerCase(lock.address)}/`
      )

      // use custom URI
      await lock.setBaseTokenURI('https://customBaseTokenURI.com/api/key/', {
        from: accounts[0],
      })
      assert.equal(
        await lock.tokenURI.call(0),
        'https://customBaseTokenURI.com/api/key/'
      )
    })

    it('should allow the lock creator to to unset the custom URI and default to the global one', async () => {
      await lock.setBaseTokenURI('', {
        from: accounts[0],
      })
      // should now return the globalBaseTokenURI + the lock address
      assert.equal(
        await lock.tokenURI.call(0),
        `https://default.com/api/key/${lowerCase(lock.address)}` + '/'
      )
      assert.equal(
        await lock.tokenURI.call(1),
        `https://default.com/api/key/${lowerCase(lock.address)}` + '/1'
      )
      assert.equal(
        await lock.tokenURI.call(123456789),
        `https://default.com/api/key/${lowerCase(lock.address)}` + '/123456789'
      )
    })

    it('should fail if someone other than the owner tries to set the URI', async () => {
      await reverts(
        lock.setBaseTokenURI('https://fakeURI.com', {
          from: accounts[1],
        }),
        'ONLY_LOCK_MANAGER'
      )
    })
  })
})
