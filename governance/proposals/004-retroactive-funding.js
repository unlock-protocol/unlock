/**
 * This just show an examples of a proposal to pay UDT to some addresses
 * that can be used for retroactive funding
 */
const ethers = require('ethers')
const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')

module.exports = ([recipientAddress]) => {
  const amount = ethers.parseEthers('0.01')

  return {
    proposalName: `Retroactive Funding: transfer ${ethers.formatEther(
      amount
    )} UDT to ${recipientAddress}`,
    calls: [
      {
        contractAddress: '0x90DE74265a416e1393A450752175AED98fe11517',
        contractNameOrAbi: UnlockDiscountTokenV2.abi,
        functionName: 'transfer',
        functionArgs: [recipientAddress, amount],
      },
    ],
  }
}
