const { time } = require('@openzeppelin/test-helpers')
const { assert } = require('chai')
const {
  deployERC20,
  purchaseKey,
  deployLock,
  ADDRESS_ZERO
} = require('../helpers')
const { ethers } = require('hardhat')

let lock

let dai

const keyPrice = ethers.utils.parseUnits('0.01', 'ether')
const totalPrice = keyPrice.mul(10)
const someDai = ethers.utils.parseUnits('10', 'ether')

contract('Lock / assess renewable terms', (accounts) => {
  const lockOwner = accounts[0]
  const keyOwner = accounts[1]
  // const referrer = accounts[3]
  let tokenId

  before(async () => {
    dai = await deployERC20(lockOwner)

    // Mint some dais for testing
    await dai.mint(keyOwner, someDai, {
      from: lockOwner,
    })

    lock = await deployLock({ tokenAddress: dai.address })

    // set ERC20 approval for entire scope
    await dai.approve(lock.address, totalPrice, {
      from: keyOwner,
    })
  
    ;({ tokenId } = await purchaseKey(lock, keyOwner, true))
    const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
    await time.increaseTo(expirationTs.toNumber())
  })

    describe('return false', () => {
      it('if terms havent changed', async () => {
        assert.equal(
          await lock.tokenTermsChanged(tokenId, ADDRESS_ZERO),
          false
        )
      })  
      it('if price has decreased', async () => {
        await lock.updateKeyPricing(
          ethers.utils.parseUnits('0.009', 'ether'),
          dai.address,
          { from: lockOwner }
        )
        assert.equal(
          await lock.tokenTermsChanged(tokenId, ADDRESS_ZERO),
          false
        )
      })
    })

    describe('return true', () => {
      it('if price has increased', async () => {
        await lock.updateKeyPricing(
          ethers.utils.parseUnits('0.3', 'ether'),
          dai.address,
          { from: lockOwner }
        )
        assert.equal(
          await lock.tokenTermsChanged(tokenId, ADDRESS_ZERO),
          true
        )
      })

      it('if erc20 token has changed', async () => {
        // deploy another token
        const dai2 = await deployERC20(accounts[3])
        await dai2.mint(keyOwner, someDai, {
          from: accounts[3],
        })
        // update lock token without changing price
        await lock.updateKeyPricing(keyPrice, dai2.address, { from: lockOwner })
        assert.equal(
          await lock.tokenTermsChanged(tokenId, ADDRESS_ZERO),
          true
        )
      })

      it('if duration has changed', async () => {
        await lock.updateLockConfig(
          1000,
          await lock.maxNumberOfKeys(),
          await lock.maxKeysPerAddress(),
          { from: lockOwner }
        )
        assert.equal(
          await lock.tokenTermsChanged(tokenId, ADDRESS_ZERO),
          true
        )
      })
    })


})