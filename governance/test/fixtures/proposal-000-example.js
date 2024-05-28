const ethers = require('ethers')
const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')
const tokenRecipientAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

module.exports = {
  proposalName: '#000 This is just an example!',
  calls: [
    {
      contractAddress: '0x90DE74265a416e1393A450752175AED98fe11517',
      contractNameOrAbi: UnlockDiscountTokenV2.abi,
      functionName: 'transfer',
      functionArgs: [tokenRecipientAddress, ethers.parseEther('0.01')],
    },
  ],
  // no payable value specified default to 0
}
