/**
 * This just show an examples of a proposal to pay UDT to some addresses
 * that can be used for retroactive funding
 */
const ethers = require('ethers')

module.exports = ([recipientAddress]) => {
  const amount = ethers.utils.parseUnits('0.01', 18)

  return {
    proposalName: `#000 Retroactive Funding: transfer ${ethers.utils.formatEther(
      amount
    )} UDT to ${recipientAddress}`,
    calls: [
      {
        contractAddress: '0x90DE74265a416e1393A450752175AED98fe11517',
        contractName: 'UnlockDiscountTokenV3',
        functionName: 'transfer',
        functionArgs: [recipientAddress, amount],
      },
    ],
  }
}
