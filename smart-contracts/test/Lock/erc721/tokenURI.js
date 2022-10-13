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
let txObj
let baseTokenURI

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

contract('Lock / erc721 / tokenURI', (accounts) => {
  before(async () => {
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
  })

  describe('the global tokenURI stored in Unlock', () => {
    it('should return the global base token URI', async () => {
      assert.equal(await unlock.globalBaseTokenURI(), '')
    })

    describe('set global base URI', () => {
      beforeEach(async () => {
        txObj = await unlock.configUnlock(
          await unlock.udt(),
          await unlock.weth(),
          0,
          await unlock.globalTokenSymbol(),
          defaultTokenURI,
          1, // mainnet
          {
            from: accounts[0],
          }
        )
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
        const event = txObj.logs.find(({ event }) => event === 'ConfigUnlock')
        assert.equal(event.args.globalTokenURI, defaultTokenURI)
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
    before(async () => {
      txObj = await lock.setLockMetadata(...Object.values(metadata), {
        from: accounts[0],
      })
    })

    it('should allow the lock creator to set a custom base tokenURI', async () => {
      await purchaseKey(lock, accounts[0])
      const uri = await lock.tokenURI(1)
      assert.equal(uri, `${metadata.baseTokenURI}1`)
    })

    it('should emit the NewLockConfig event', async () => {
      const event = txObj.logs.find(({ event }) => event === 'NewLockConfig')
      assert.equal(event.args.baseTokenURI, metadata.baseTokenURI)
    })

    it('should let anyone get the baseTokenURI for a lock by passing tokenId 0', async () => {
      // here we pass 0 as the tokenId to get the baseTokenURI
      baseTokenURI = await lock.tokenURI(0)
      assert.equal(baseTokenURI, metadata.baseTokenURI)
    })

    it('should allow the lock creator to to unset the custom URI and default to the global one', async () => {
      await lock.setLockMetadata(
        metadata.name,
        metadata.symbol,
        '', //baseTokenURI
        {
          from: accounts[0],
        }
      )

      const baseTokenURI = await lock.tokenURI(0)
      const lockAddressStr = lock.address.toString()
      const lowerCaseAddress = stringShifter(lockAddressStr)

      // should now return the globalBaseTokenURI + the lock address
      assert.equal(baseTokenURI, `${defaultTokenURI}${lowerCaseAddress}/`)

      const uri = await lock.tokenURI(1)
      assert.equal(uri, `${defaultTokenURI}${lowerCaseAddress}` + '/1')
    })
  })

  it('should fail if someone other than the owner tries to set the URI', async () => {
    await reverts(
      lock.setLockMetadata(...Object.values(metadata), {
        from: accounts[1],
      }),
      'ONLY_LOCK_MANAGER'
    )
  })
})
