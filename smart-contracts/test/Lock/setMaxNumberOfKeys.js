const { ethers } = require('hardhat')
const { expectRevert } = require('@openzeppelin/test-helpers')
const { assert } = require('chai')
const { getProxyAddress } = require('../../helpers/deployments')
const createLockHash = require('../helpers/createLockCalldata')

const keyPrice = ethers.utils.parseEther('0.01')

contract('Lock / setMaxNumberOfKeys', () => {
  let unlock
  let lock

  describe('update the number of keys available in a lock', () => {
    beforeEach(async () => {
      const chainId = 31337
      const unlockAddress = getProxyAddress(chainId, 'Unlock')

      // parse unlock
      const [from] = await ethers.getSigners()
      const Unlock = await ethers.getContractFactory('Unlock')
      unlock = Unlock.attach(unlockAddress)

      // create a new lock
      const tokenAddress = web3.utils.padLeft(0, 40)
      const args = [60 * 60 * 24 * 30, tokenAddress, keyPrice, 10, 'Test lock']

      const calldata = await createLockHash({ args, from: from.address })
      const tx = await unlock.createUpgradeableLock(calldata)
      const { events } = await tx.wait()
      const {
        args: { newLockAddress },
      } = events.find(({ event }) => event === 'NewLock')

      const PublicLock = await ethers.getContractFactory('PublicLock')
      lock = PublicLock.attach(newLockAddress)
    })

    it('should increase max number of keys', async () => {
      const [, ...buyers] = await ethers.getSigners()

      // buy 10 key
      const tx = await lock.connect(buyers[0]).purchase(
        [],
        buyers.slice(0, 10).map((b) => b.address),
        buyers.slice(0, 10).map(() => web3.utils.padLeft(0, 40)),
        buyers.slice(0, 10).map(() => web3.utils.padLeft(0, 40)),
        [[]],
        {
          value: keyPrice.mul(buyers.length).toString(),
        }
      )

      await tx.wait()

      // try to buy another key exceding totalSupply
      await expectRevert(
        lock
          .connect(buyers[11])
          .purchase(
            [],
            [buyers[11].address],
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [[]],
            {
              value: keyPrice.toString(),
            }
          ),
        'LOCK_SOLD_OUT'
      )

      // increase supply
      await lock.setMaxNumberOfKeys(12)

      // actually buy the key
      const tx2 = await lock
        .connect(buyers[11])
        .purchase(
          [],
          [buyers[11].address],
          [web3.utils.padLeft(0, 40)],
          [web3.utils.padLeft(0, 40)],
          [],
          {
            value: keyPrice.toString(),
          }
        )

      //
      const { events } = await tx2.wait()
      const transfer = events.find(({ event }) => event === 'Transfer')
      assert.equal(transfer.args.to, buyers[11].address)
      assert.equal(await lock.maxNumberOfKeys(), 12)
    })

    it('should prevent from setting a value lower than total supply', async () => {
      // buy 10 keys
      const [, ...buyers] = await ethers.getSigners()
      const tx = await lock.connect(buyers[0]).purchase(
        [],
        buyers.map((b) => b.address),
        buyers.map(() => web3.utils.padLeft(0, 40)),
        buyers.map(() => web3.utils.padLeft(0, 40)),
        [[]],
        {
          value: keyPrice.mul(buyers.length).toString(),
        }
      )
      await tx.wait()

      // increase supply
      await expectRevert(
        lock.setMaxNumberOfKeys(5),
        'maxNumberOfKeys is smaller than existing supply'
      )
    })

    it('should allow setting a value equal to current total supply', async () => {
      // buy 10 keys
      const [, ...buyers] = await ethers.getSigners()
      const tx = await lock.connect(buyers[0]).purchase(
        [],
        buyers.slice(0, 10).map((b) => b.address),
        buyers.slice(0, 10).map(() => web3.utils.padLeft(0, 40)),
        buyers.slice(0, 10).map(() => web3.utils.padLeft(0, 40)),
        [[]],
        {
          value: keyPrice.mul(buyers.length).toString(),
        }
      )
      await tx.wait()

      // set max keys to total supply
      const totalSupply = await lock.totalSupply()
      await lock.setMaxNumberOfKeys(totalSupply)
      assert.equal(
        (await lock.maxNumberOfKeys()).toString(),
        totalSupply.toString()
      )

      // try to buy another key exceding totalSupply
      await expectRevert(
        lock
          .connect(buyers[11])
          .purchase(
            [keyPrice.toString()],
            [buyers[11].address],
            [web3.utils.padLeft(0, 40)],
            [web3.utils.padLeft(0, 40)],
            [[]],
            {
              value: keyPrice.toString(),
            }
          ),
        'LOCK_SOLD_OUT'
      )
    })
  })
})
