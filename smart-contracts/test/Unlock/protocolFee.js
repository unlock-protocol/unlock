const { ethers } = require('hardhat')
const { deployLock, deployERC20, deployContracts, purchaseKey, reverts, ADDRESS_ZERO, getBalanceEthers } = require('../helpers')

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
      expect((await unlock.fee()).toString()).to.equals('0')
    })
    it('can be changed', async () => {
      expect((await unlock.fee()).toString()).to.equals('0')
      await unlock.setProtocolFee(120)
      expect((await unlock.fee()).toString()).to.equals('120')
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
    let lock, dai, tokenAddress, unlockOwner, keyOwner, keyPrice, unlockBalanceBefore


    describe(`Pay protocol fee using ${isErc20 ? 'ERC20' : 'ETH'}`, () => {
      before(async () => {
        ;[unlockOwner, keyOwner] = await ethers.getSigners()

        if(isErc20) {
          dai = await deployERC20(unlockOwner)
          // Mint some dais for testing
          await dai.mint(keyOwner.address, someDai)
        }

        tokenAddress = isErc20 ? dai.address : ADDRESS_ZERO
        

        // deploy a lock
        lock = await deployLock({ unlock, tokenAddress, isEthers: true })
        keyPrice = await lock.keyPrice()
        unlockBalanceBefore = await getBalanceEthers(unlock.address, tokenAddress)

        // set fee to 12%
        await unlock.setProtocolFee(120)
      })

      it('fee is set correctly in Unlock ', async () => {
        expect((await unlock.fee()).toNumber()).to.equals(120)
      })

      it('pays the fee to Unlock correctly', async () => {
        await purchaseKey(lock, keyOwner.address, isErc20)
        const fee = keyPrice.mul(await unlock.fee()).div(BASIS_POINT_DENOMINATOR)
        expect(fee.toString()).to.not.equals('0')
        const unlockBalanceAfter = await getBalanceEthers(unlock.address, tokenAddress)
        expect(unlockBalanceAfter.toString()).to.equals(
          unlockBalanceBefore.add(fee).toString()
        )
      })

      it('pays fees to Unlock correctly when buying multiple keys')
    })
  })
})