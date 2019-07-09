const BigNumber = require('bignumber.js');
const UnlockDiscountToken = artifacts.require('../UnlockDiscountToken.sol');

let unlockDiscountToken;

contract('UnlockDiscountToken', accounts => {
  before(async () => {
    unlockDiscountToken = await UnlockDiscountToken.deployed();
  });

  describe('Supply', () => {
    it('Starting supply is 0', async () => {
      const totalSupply = new BigNumber(await unlockDiscountToken.totalSupply());
      assert(totalSupply.eq(0), 'starting supply must be 0');
    });

    it('Minting tokens', async () => {
      const mintAmount = 1000;
      const recipient = accounts[1];
      const balanceBefore = new BigNumber(await unlockDiscountToken.balanceOf(recipient));
      const totalSupplyBefore = await unlockDiscountToken.totalSupply();

      before(async () => {
        await unlockDiscountToken.mint(
          recipient,
          mintAmount,
          {from: accounts[0]}
        );
      });

      it('Balance went up', async () => {
        const balanceAfter = await unlockDiscountToken.balanceOf(recipient);
        assert(balanceAfter.eq(
          balanceBefore.plus(mintAmount)
        ), 'Balance must increase by amount minted');
      });

      it('Total supply went up', async () => {
        const totalSupplyAfter = await unlockDiscountToken.totalSupply();
        assert(totalSupplyAfter.eq(
          totalSupplyBefore.plus(mintAmount)
        ), 'Total supply must increase by amount minted');
      });
    });
  });

  describe('Transfer', () => {
    const mintAmount = 1000000;

    before(async () => {
      for (let i = 0; i < 3; i++)
        await unlockDiscountToken.mint(accounts[i], mintAmount, {from: accounts[0]})
    });

    describe('transfer', async () => {
      const transferAmount = new BigNumber(123);
      let balanceBefore0, balanceBefore1;

      before(async () => {
        balanceBefore0 = new BigNumber(await unlockDiscountToken.balanceOf(accounts[0]));
        balanceBefore1 = new BigNumber(await unlockDiscountToken.balanceOf(accounts[1]));
      });

      it('normal transfer', async () => {
        await unlockDiscountToken.transfer(
          accounts[1],
          transferAmount,
          {from: accounts[0]}
        );
        const balanceAfter0 = new BigNumber(await unlockDiscountToken.balanceOf(accounts[0]));
        const balanceAfter1 = new BigNumber(await unlockDiscountToken.balanceOf(accounts[1]));
        assert(balanceBefore0.minus(transferAmount).eq(balanceAfter0), 'Sender balance must have gone down by amount sent');
        assert(balanceBefore1.plus(transferAmount).eq(balanceAfter1), 'Recipient balance must have gone down by amount sent');
      })
    })
  })
});
