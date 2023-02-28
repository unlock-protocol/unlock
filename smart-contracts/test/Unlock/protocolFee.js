const { ethers } = require('hardhat')
const { deployLock, deployERC20, deployContracts, purchaseKey, purchaseKeys, reverts, ADDRESS_ZERO, getBalanceEthers } = require('../helpers')
const { time } = require('@openzeppelin/test-helpers')

const scenarios = [false, true]
const someDai = ethers.utils.parseEther('10')
const BASIS_POINT_DENOMINATOR = 10000
 
contract('Unlock / protocolFee', async () => {
  let unlock

  before(async () => {
    ;({ unlockEthers: unlock } = await deployContracts())
  })

  describe('setProtocolFee', () => {
    it('default to zero', async () => {
      expect((await unlock.protocolFee()).toString()).to.equals('0')
    })
    it('can be changed', async () => {
      expect((await unlock.protocolFee()).toString()).to.equals('0')
      await unlock.setProtocolFee(120)
      expect((await unlock.protocolFee()).toString()).to.equals('120')
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

        if(isErc20) {
          dai = await deployERC20(unlockOwner, true)
          // Mint some dais for testing
          await dai.mint(keyOwner.address, someDai)
        }
        tokenAddress = isErc20 ? dai.address : ADDRESS_ZERO

        // deploy a lock
        lock = await deployLock({ unlock, tokenAddress, isEthers: true })
        keyPrice = await lock.keyPrice()

        // set fee to 12%
        await unlock.setProtocolFee(120)
        fee = keyPrice.mul(await unlock.protocolFee()).div(BASIS_POINT_DENOMINATOR)
      })

      it('fee is set correctly in Unlock ', async () => {
        expect((await unlock.protocolFee()).toNumber()).to.equals(120)
        expect(fee.toString()).to.not.equals('0')
      })

      describe('pays fees to Unlock correctly when', () => {
        it('purchasing a single key', async () => {
          const unlockBalanceBefore = await getBalanceEthers(unlock.address, tokenAddress)
          if(isErc20) {
            await dai.connect(keyOwner).approve(lock.address, keyPrice)
          }
          await purchaseKey(lock, keyOwner.address, isErc20, keyPrice)
          const fee = keyPrice.mul(await unlock.protocolFee()).div(BASIS_POINT_DENOMINATOR)
          
          const unlockBalanceAfter = await getBalanceEthers(unlock.address, tokenAddress)
          expect(unlockBalanceAfter.toString()).to.equals(
            unlockBalanceBefore.add(fee).toString()
          )
        })

        it('purchasing multiple keys', async () => {
          const unlockBalanceBefore = await getBalanceEthers(unlock.address, tokenAddress)
          if(isErc20) {
            await dai.connect(keyOwner).approve(lock.address, keyPrice.mul(3))
          }
          await purchaseKeys(lock, 3, isErc20, keyOwner)
          const unlockBalanceAfter = await getBalanceEthers(unlock.address, tokenAddress)
          expect(unlockBalanceAfter.toString()).to.equals(
            unlockBalanceBefore.add(fee.mul(3)).toString()
          )
        })

        it('extending a key', async () => {
          const unlockBalanceBefore = await getBalanceEthers(unlock.address, tokenAddress)
          if(isErc20) {
            await dai.connect(keyOwner).approve(lock.address, keyPrice.mul(2))
          }
          const { tokenId } = await purchaseKey(lock, keyOwner.address, isErc20, keyPrice)
          await lock.connect(keyOwner).extend(
            isErc20 ? keyPrice : 0,
            tokenId,
            ADDRESS_ZERO,
            [],
            {
              value: isErc20 ? 0 : keyPrice,
            }
          )
          const unlockBalanceAfter = await getBalanceEthers(unlock.address, tokenAddress)
          expect(unlockBalanceAfter.toString()).to.equals(
            unlockBalanceBefore.add(fee.mul(2)).toString()
          )
        })

        if(isErc20) {
          it('renewing a key', async () => {
            const unlockBalanceBefore = await getBalanceEthers(unlock.address, tokenAddress)
            
            await dai.connect(keyOwner).approve(lock.address, keyPrice.mul(2))
            const { tokenId } = await purchaseKey(lock, keyOwner.address, true)
            const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
            await time.increaseTo(expirationTs.toNumber())
            
            await lock.renewMembershipFor(tokenId, ADDRESS_ZERO) 
            const unlockBalanceAfter = await getBalanceEthers(unlock.address, tokenAddress)
            expect(unlockBalanceAfter.toString()).to.equals(
              unlockBalanceBefore.add(fee.mul(2)).toString()
            )
          })
        }
      })
    })
  })
})