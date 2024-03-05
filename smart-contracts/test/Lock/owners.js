const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  purchaseKeys,
  ADDRESS_ZERO,
  compareBigNumbers,
} = require('../helpers')

let lock
let tokenIds
let keyOwners
let random

describe('Lock / owners', () => {
  before(async () => {
    random = (await ethers.getSigners())[10]
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
  })

  before(async () => {
    // Purchase keys!
    ;({ tokenIds, keyOwners } = await purchaseKeys(lock, 5))
    keyOwners = await Promise.all(
      await keyOwners.map((k) => ethers.getSigner(k))
    )
  })

  it('should have the right number of keys', async () => {
    const totalSupply = await lock.totalSupply()
    compareBigNumbers(totalSupply, keyOwners.length)
  })

  it('should have the right number of owners', async () => {
    const numberOfOwners = await lock.numberOfOwners()
    compareBigNumbers(numberOfOwners, keyOwners.length)
  })

  describe('after a transfer to a new address', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = await lock.numberOfOwners()
      await lock
        .connect(keyOwners[0])
        .transferFrom(keyOwners[0].address, random.address, tokenIds[0])
    })

    it('should have the right number of keys', async () => {
      compareBigNumbers(await lock.totalSupply(), tokenIds.length)
    })

    it('should have the right number of owners', async () => {
      compareBigNumbers(await lock.balanceOf(random.address), 1)
      compareBigNumbers(await lock.balanceOf(keyOwners[0].address), 0)
      compareBigNumbers(await lock.numberOfOwners(), numberOfOwners)
    })
  })

  describe('after a transfer to an existing owner', () => {
    let numberOfOwners

    before(async () => {
      numberOfOwners = await lock.numberOfOwners()

      // both have tokens
      compareBigNumbers(await lock.balanceOf(keyOwners[1].address), 1)
      compareBigNumbers(await lock.balanceOf(keyOwners[2].address), 1)
      await lock
        .connect(keyOwners[1])
        .transferFrom(keyOwners[1].address, keyOwners[2].address, tokenIds[1])
    })

    it('should have the right number of keys', async () => {
      compareBigNumbers(await lock.totalSupply(), tokenIds.length)
    })

    it('should have the right number of owners', async () => {
      compareBigNumbers(await lock.numberOfOwners(), numberOfOwners.sub(1))
    })
  })

  // test case proofing https://github.com/code-423n4/2021-11-unlock-findings/issues/120
  describe('after a transfer to a existing owner, buying a key again for someone who already owned one', () => {
    it('should preserve the right number of owners', async () => {
      // initial state
      const numberOfOwners = await lock.numberOfOwners()
      const totalSupplyBefore = await lock.totalSupply()

      // transfer the key to an existing owner
      assert.equal(await lock.balanceOf(keyOwners[4].address), 1)
      await lock
        .connect(keyOwners[3])
        .transferFrom(keyOwners[3].address, keyOwners[4].address, tokenIds[3])
      compareBigNumbers(await lock.ownerOf(tokenIds[3]), keyOwners[4].address)
      compareBigNumbers(await lock.balanceOf(keyOwners[4].address), 2)
      compareBigNumbers(await lock.balanceOf(keyOwners[3].address), 0)

      // supply unchanged
      compareBigNumbers(totalSupplyBefore, await lock.totalSupply())

      // number of owners changed
      compareBigNumbers(numberOfOwners.sub(1), await lock.numberOfOwners())

      // someone buys a key again for the previous owner
      await lock.purchase(
        [],
        [keyOwners[3].address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: await lock.keyPrice(),
        }
      )

      // number of owners should be left unchanged
      const _numberOfOwners = await lock.numberOfOwners()
      compareBigNumbers(_numberOfOwners, numberOfOwners)
    })
  })
})
