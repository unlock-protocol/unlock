const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  deployERC20,
  deployContracts,
  purchaseKey,
  purchaseKeys,
  reverts,
  ADDRESS_ZERO,
  getBalance,
  increaseTimeTo,
} = require('../helpers')

const scenarios = [false, true]
const someDai = ethers.parseEther('10')
const BASIS_POINT_DENOMINATOR = 10000n

describe('Unlock / protocolFee', async () => {
  let unlock

  before(async () => {
    ;({ unlock } = await deployContracts())
  })

  describe('setProtocolFee', () => {
    it('default to zero', async () => {
      assert.equal(await unlock.protocolFee(), '0')
    })
    it('can be changed', async () => {
      assert.equal(await unlock.protocolFee(), '0')
      await unlock.setProtocolFee(120)
      assert.equal(await unlock.protocolFee(), '120')
    })
    it('can be changed only by owner', async () => {
      const [, someSigner] = await ethers.getSigners()
      await reverts(
        unlock.connect(someSigner).setProtocolFee(120),
        'ONLY_OWNER'
      )
    })
  })

  scenarios.forEach((isErc20) => {
    let lock, dai, tokenAddress, unlockOwner, keyOwner, keyPrice, fee

    describe(`Pay protocol fee using ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[unlockOwner, keyOwner] = await ethers.getSigners()

        if (isErc20) {
          dai = await deployERC20(unlockOwner, true)
          // Mint some dais for testing
          await dai.mint(await keyOwner.getAddress(), someDai)
        }
        tokenAddress = isErc20 ? await dai.getAddress() : ADDRESS_ZERO

        // deploy a lock
        lock = await deployLock({ unlock, tokenAddress, isEthers: true })
        keyPrice = await lock.keyPrice()

        // set fee to 12%
        await unlock.setProtocolFee(120)
        fee =
          (keyPrice * (await unlock.protocolFee())) / BASIS_POINT_DENOMINATOR
      })

      it('fee is set correctly in Unlock ', async () => {
        assert.equal(await unlock.protocolFee(), 120)
        assert.notEqual(fee, '0')
      })

      describe('pays fees to Unlock correctly when', () => {
        it('purchasing a single key', async () => {
          const unlockBalanceBefore = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          if (isErc20) {
            await dai
              .connect(keyOwner)
              .approve(await lock.getAddress(), keyPrice)
          }
          await purchaseKey(
            lock,
            await keyOwner.getAddress(),
            isErc20,
            keyPrice
          )
          const fee =
            (keyPrice * (await unlock.protocolFee())) / BASIS_POINT_DENOMINATOR

          const unlockBalanceAfter = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          assert.equal(unlockBalanceAfter, unlockBalanceBefore + fee)
        })

        it('purchasing multiple keys', async () => {
          const unlockBalanceBefore = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          if (isErc20) {
            await dai
              .connect(keyOwner)
              .approve(await lock.getAddress(), keyPrice * 3n)
          }
          await purchaseKeys(lock, 3, isErc20, keyOwner)
          const unlockBalanceAfter = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          assert.equal(unlockBalanceAfter, unlockBalanceBefore + fee * 3n)
        })

        it('extending a key', async () => {
          const unlockBalanceBefore = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          if (isErc20) {
            await dai
              .connect(keyOwner)
              .approve(await lock.getAddress(), keyPrice * 2n)
          }
          const { tokenId } = await purchaseKey(
            lock,
            await keyOwner.getAddress(),
            isErc20,
            keyPrice
          )
          await lock
            .connect(keyOwner)
            .extend(isErc20 ? keyPrice : 0, tokenId, ADDRESS_ZERO, '0x', {
              value: isErc20 ? 0 : keyPrice,
            })
          const unlockBalanceAfter = await getBalance(
            await unlock.getAddress(),
            tokenAddress
          )
          assert.equal(unlockBalanceAfter, unlockBalanceBefore + fee * 2n)
        })

        if (isErc20) {
          it('renewing a key', async () => {
            const unlockBalanceBefore = await getBalance(
              await unlock.getAddress(),
              tokenAddress
            )

            await dai
              .connect(keyOwner)
              .approve(await lock.getAddress(), keyPrice * 2n)
            const { tokenId } = await purchaseKey(
              lock,
              await keyOwner.getAddress(),
              true
            )
            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await increaseTimeTo(expirationTs)

            await lock.renewMembershipFor(tokenId, ADDRESS_ZERO)
            const unlockBalanceAfter = await getBalance(
              await unlock.getAddress(),
              tokenAddress
            )
            assert.equal(unlockBalanceAfter, unlockBalanceBefore + fee * 2n)
          })
        }
      })
    })
  })
})
