const { ethers } = require('hardhat')
const { assert } = require('chai')

const { deployLock, reverts, ADDRESS_ZERO, purchaseKey } = require('../helpers')

contract('Lock / maxKeysPerAddress', (accounts) => {
  let keyOwner = accounts[1]
  let lock

  before(async () => {
    lock = await deployLock()
  })

  describe('enforcing the number of keys per address', () => {
    let tokenId
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })

    it('default to 1', async () => {
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 1)
    })

    it('prevent users to purchase more keys than allowed', async () => {
      await reverts(
        lock.purchase([], [keyOwner], [ADDRESS_ZERO], [ADDRESS_ZERO], [[]], {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }),
        'MAX_KEYS'
      )
    })

    it('prevent users from purchasing multiple keys at once', async () => {
      await reverts(
        lock.purchase(
          [],
          [accounts[9], accounts[9]],
          [ADDRESS_ZERO, ADDRESS_ZERO],
          [ADDRESS_ZERO, ADDRESS_ZERO],
          [[]],
          {
            value: ethers.utils.parseUnits('0.01', 'ether'),
          }
        ),
        'MAX_KEYS'
      )
    })

    it('prevent user from sharing a key with someone who has more keys than allowed', async () => {
      await lock.purchase(
        [],
        [accounts[9]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
      await reverts(
        lock.shareKey(accounts[9], tokenId, 1000, {
          from: keyOwner,
        }),
        'MAX_KEYS'
      )
    })

    it('prevent user from transferring a key with someone who has more keys than allowed', async () => {
      await lock.purchase(
        [],
        [accounts[8]],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
      await reverts(
        lock.transfer(tokenId, accounts[8], 1000, {
          from: keyOwner,
        }),
        'MAX_KEYS'
      )
    })
  })
})
