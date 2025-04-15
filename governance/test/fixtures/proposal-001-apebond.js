const ethers = require('ethers')
const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')
const tokenRecipientAddress = '0xa7865ECE6DAB013E7131983b943c2c75D7Fa0D1F' // Bond treasury address on base

module.exports = {
  proposalName:
    'Transfer Additional UP Tokens to ApeBond Treasury Address - $40,000',
  calls: [
    {
      contractAddress: '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187', // UP Token address on base
      contractNameOrAbi: UnlockDiscountTokenV2.abi,
      functionName: 'transfer',
      functionArgs: [tokenRecipientAddress, ethers.parseEther('100')],
    },
  ],
  // no payable value specified default to 0
}
