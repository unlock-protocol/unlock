const { ethers } = require('hardhat')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')

module.exports = async () => {
  const recipientAddress = '0xa7865ECE6DAB013E7131983b943c2c75D7Fa0D1F'
  const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
  const initialTransferAmount = ethers.parseUnits('6092920', 'ether')
  const additionalTransferAmount = ethers.parseUnits('5348728', 'ether')
  const upPrice = '0.006992'

  const calls = [
    {
      contractAddress: upTokenAddress,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'transfer',
      functionArgs: [recipientAddress, additionalTransferAmount],
      value: 0,
    },
  ]

  const proposalName = `# Additional Transfer of UP Tokens to Establish Sustainable Liquidity with ICHI and ApeBond

### Goal of the Proposal

This proposal aims to create a sustainable liquidity pool for the UP token on Uniswap (Base) by utilizing an ICHI single-token deposit vault and conducting a liquidity bond sale through ApeBond. This strategy seeks to establish protocol-owned liquidity (POL), ensuring long-term stability and generating recurring revenue for the DAO through trading fees.  

**Bond Treasury Address**: ${recipientAddress}  
**UP Token Amount**: Additional ${additionalTransferAmount} UP @ $${upPrice} ~ $37,399 to adjust for price decline, ensuring the total remains at ~$80,000.

### Background on Additional Transfer

At the time of the original proposal, the UP token was valued at **$0.01313**, and **${initialTransferAmount} UP** tokens were transferred, amounting to approximately **$80,000**. However, due to the price drop to **$${upPrice}**, the previously transferred amount now equates to only **$${initialTransferAmount}**. To address this shortfall, this proposal includes an additional transfer of **${additionalTransferAmount} UP** tokens at current price of $${upPrice} to ensure the total value remains at approximately **$80,000**.


### Conclusion

ApeBond will raise funds through the bond sale, and ICHI will manage the liquidity in a V3 position, ensuring efficient use of the DAO's resources. This proposal provides a comprehensive plan to establish sustainable liquidity, mitigate risks, and generate recurring revenue for the DAO. We recommend proceeding with this plan to enhance the UP token's market presence and secure long-term liquidity.

For the full proposal, please visit: [Snapshot Proposal](https://snapshot.box/#/s:unlock-dao.eth/proposal/0x88af568ac5dc2f58fbf8ad71217f7bd443e7702a41dbcaa85fb4107f12320e33)`

  return { proposalName, calls }
}
