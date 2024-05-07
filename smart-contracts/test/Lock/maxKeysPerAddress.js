const { ethers } = require('hardhat')

const {
  deployLock,
  reverts,
  ADDRESS_ZERO,
  purchaseKey,
  compareBigNumbers,
} = require('../helpers')

describe('Lock / maxKeysPerAddress', () => {
  let keyOwner, someAccount, anotherAccount
  let lock

  before(async () => {
    ;[, keyOwner, { address: someAccount }, { address: anotherAccount }] =
      await ethers.getSigners()
    lock = await deployLock({ name: 'NO_MAX_KEYS' })
  })

  describe('enforcing the number of keys per address', () => {
    let tokenId
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    })

    it('default to 1', async () => {
      compareBigNumbers(await lock.maxKeysPerAddress(), 1)
    })

    it('prevent users to purchase more keys than allowed', async () => {
      await reverts(
        lock.purchase(
          [],
          [await keyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: ethers.parseUnits('0.01', 'ether'),
          }
        ),
        'MAX_KEYS'
      )
    })

    it('prevent users from purchasing multiple keys at once', async () => {
      await reverts(
        lock.purchase(
          [],
          [someAccount, someAccount],
          [ADDRESS_ZERO, ADDRESS_ZERO],
          [ADDRESS_ZERO, ADDRESS_ZERO],
          [[], []],
          {
            value: ethers.parseUnits('0.02', 'ether'),
          }
        ),
        'MAX_KEYS'
      )
    })

    it('prevent user from sharing a key with someone who has more keys than allowed', async () => {
      await lock.purchase(
        [],
        [someAccount],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.parseUnits('0.01', 'ether'),
        }
      )
      await reverts(
        lock.connect(keyOwner).shareKey(someAccount, tokenId, 1000),
        'MAX_KEYS'
      )
    })

    it('prevent user from transferring a key with someone who has more keys than allowed', async () => {
      await lock.purchase(
        [],
        [anotherAccount],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: ethers.parseUnits('0.01', 'ether'),
        }
      )
      await reverts(
        lock
          .connect(keyOwner)
          .transferFrom(await keyOwner.getAddress(), anotherAccount, tokenId),
        'MAX_KEYS'
      )
    })
  })
})
