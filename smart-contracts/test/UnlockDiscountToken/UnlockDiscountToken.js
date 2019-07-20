const BigNumber = require('bignumber.js')
const shouldFail = require('../helpers/shouldFail')

const UnlockDiscountToken = artifacts.require('../UnlockDiscountToken.sol')
const getProxy = require('../helpers/proxy')

contract('UnlockDiscountToken', accounts => {
  let unlockDiscountToken
  const owner = accounts[9]

  before(async () => {
    unlockDiscountToken = await getProxy(UnlockDiscountToken)
  })

  it('shouldFail to call init again', async () => {
    await shouldFail(unlockDiscountToken.initialize())
  })

  describe('Supply', () => {
    it('Starting supply is 0', async () => {
      const totalSupply = new BigNumber(await unlockDiscountToken.totalSupply())
      assert(totalSupply.eq(0), 'starting supply must be 0')
    })

    describe('Minting tokens', () => {
      const mintAmount = 1000
      const recipient = accounts[1]
      let balanceBefore
      let totalSupplyBefore

      before(async () => {
        balanceBefore = new BigNumber(
          await unlockDiscountToken.balanceOf(recipient)
        )
        totalSupplyBefore = new BigNumber(
          await unlockDiscountToken.totalSupply()
        )
        await unlockDiscountToken.mint(recipient, mintAmount, {
          from: owner,
        })
      })

      it('Balance went up', async () => {
        const balanceAfter = new BigNumber(
          await unlockDiscountToken.balanceOf(recipient)
        )
        assert.equal(
          balanceAfter.toFixed(),
          balanceBefore.plus(mintAmount).toFixed(),
          'Balance must increase by amount minted'
        )
      })

      it('Total supply went up', async () => {
        const totalSupplyAfter = new BigNumber(
          await unlockDiscountToken.totalSupply()
        )
        assert.equal(
          totalSupplyAfter.toFixed(),
          totalSupplyBefore.plus(mintAmount).toFixed(),
          'Total supply must increase by amount minted'
        )
      })
    })
  })

  describe('Transfer', () => {
    const mintAmount = 1000000

    before(async () => {
      for (let i = 0; i < 3; i++) {
        await unlockDiscountToken.mint(accounts[i], mintAmount, {
          from: owner,
        })
      }
    })

    describe('transfer', async () => {
      const transferAmount = new BigNumber(123)
      let balanceBefore0, balanceBefore1

      before(async () => {
        balanceBefore0 = new BigNumber(
          await unlockDiscountToken.balanceOf(accounts[0])
        )
        balanceBefore1 = new BigNumber(
          await unlockDiscountToken.balanceOf(accounts[1])
        )
      })

      it('normal transfer', async () => {
        await unlockDiscountToken.transfer(accounts[1], transferAmount, {
          from: accounts[0],
        })
        const balanceAfter0 = new BigNumber(
          await unlockDiscountToken.balanceOf(accounts[0])
        )
        const balanceAfter1 = new BigNumber(
          await unlockDiscountToken.balanceOf(accounts[1])
        )
        assert(
          balanceBefore0.minus(transferAmount).eq(balanceAfter0),
          'Sender balance must have gone down by amount sent'
        )
        assert(
          balanceBefore1.plus(transferAmount).eq(balanceAfter1),
          'Recipient balance must have gone down by amount sent'
        )
      })
    })
  })
})
