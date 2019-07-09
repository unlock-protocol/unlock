const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js');

const UnlockDiscountToken = artifacts.require('../UnlockDiscountToken.sol')

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
      const targetBalanceAfter = balanceBefore.plus(mintAmount);

      await unlockDiscountToken.mint(
        recipient,
        mintAmount,
        {from: accounts[0]}
      );

      const balanceAfter = await unlockDiscountToken.balanceOf(recipient);
      assert(targetBalanceAfter.eq(balanceAfter), 'Balance must increase by amount minted');
    });

    it('Token transfer')

    it('Initializing again must fail', async () => {

    })
  });

});
