const { ethers } = require('hardhat')
const { assert } = require('chai')

const { deployLock, reverts, ADDRESS_ZERO, purchaseKey } = require('../helpers')

describe('Lock / maxKeysPerAddress', () => {
  let lock
  let keyOwner
  let anotherAccount
  let yetAnotherAccount

  before(async () => {
    ;[, keyOwner, anotherAccount, yetAnotherAccount] = await ethers.getSigners()
    lock = await deployLock()
  })

  it('default to 1', async () => {
    assert.equal((await lock.maxKeysPerAddress()).toNumber(), 1)
  })

  describe('set/get maxKeysPerAddress', () => {
    it('can only be invaccounts[9]oked by lock manager', async () => {
      await reverts(
        lock.connect(anotherAccount).setMaxKeysPerAddress(10),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('could not be set to zero', async () => {
      await reverts(lock.setMaxKeysPerAddress(0), 'NULL_VALUE')
    })

    it('update the maxKeysPerAddress correctly', async () => {
      await lock.setMaxKeysPerAddress(10)
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 10)

      await lock.setMaxKeysPerAddress(1234567890)
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 1234567890)

      await lock.setMaxKeysPerAddress(1)
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 1)
    })
  })

  describe('enforcing the number of keys per address', () => {
    let tokenId
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })

    it('prevent users to purchase more keys than allowed', async () => {
      await reverts(
        lock.purchase(
          [],
          [keyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: ethers.utils.parseUnits('0.01', 'ether'),
          }
        ),
        'MAX_KEYS'
      )
    })

    it('prevent users from purchasing multiple keys at once', async () => {
      await reverts(
        lock.purchase(
          [],
          [anotherAccount.address, anotherAccount.address],
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
        [anotherAccount.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
      await reverts(
        lock.connect(keyOwner).shareKey(anotherAccount.address, tokenId, 1000),
        'MAX_KEYS'
      )
    })

    it('prevent user from transferring a key with someone who has more keys than allowed', async () => {
      await lock.purchase(
        [],
        [yetAnotherAccount.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.utils.parseUnits('0.01', 'ether'),
        }
      )
      await reverts(
        lock
          .connect(keyOwner)
          .transfer(tokenId, yetAnotherAccount.address, 1000),
        'MAX_KEYS'
      )
    })
  })
})
