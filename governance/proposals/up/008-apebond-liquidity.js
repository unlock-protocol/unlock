const { ethers } = require('hardhat')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const { getTokenInfo } = require('@unlock-protocol/hardhat-helpers')

module.exports = async () => {
  const bondTreasuryAddress = '0xa7865ECE6DAB013E7131983b943c2c75D7Fa0D1F' // Provided by monkey.biz (Biz) via discord here: https://discord.com/channels/462280183425138719/1293630882619461713/1340372247344320552
  const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
  const { decimals: tokenDecimals } = await getTokenInfo(upTokenAddress)
  const additionalTransferAmount = ethers.parseUnits('1530600', tokenDecimals)
  const upPrice = '0.005247'

  const calls = [
    {
      contractAddress: upTokenAddress,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'transfer',
      functionArgs: [bondTreasuryAddress, additionalTransferAmount],
      value: 0,
    },
  ]

  const proposalName = `# Transfer Additional UP Tokens to ApeBond Treasury Address to Establish Sustainable Liquidity with ICHI and ApeBond

### Goal of the Proposal

This proposal aims to transfer additional UP tokens to the ApeBond treasury address to make up for the deficit in the amount needed to establish a bond sale due to the UP token price drop. The origina proposal was intended to have a bond sale of $80,000 but due to recent conversations on discord it has been reviewed to $40,000. [View discussion on discord](https://discord.com/channels/462280183425138719/1293630882619461713)   

**Bond Treasury Address**: 0xa7865ECE6DAB013E7131983b943c2c75D7Fa0D1F  
**Source**: Provided by monkey.biz (Biz) via Discord [link to message](https://discord.com/channels/462280183425138719/1293630882619461713/1340372247344320552)  
**UP Token Amount**: Additional ${additionalTransferAmount} UP @ $${upPrice} to adjust for price decline, ensuring the total remains at ~$40,000.
**Discord Thread on Sustainable Liquidity**: [view here](https://discord.com/channels/462280183425138719/1293630882619461713)  

### Background on Additional Transfer

You can review the initial UP transfer proposal, please visit: [Tally proposal](https://www.tally.xyz/gov/unlock-protocol/proposal/66159557871463036352079877875279011678607759474328832734922639081012783502903)    

### Conclusion

For the full proposal, please visit: [Snapshot Proposal](https://snapshot.box/#/s:unlock-dao.eth/proposal/0x88af568ac5dc2f58fbf8ad71217f7bd443e7702a41dbcaa85fb4107f12320e33)  

Thank you for your time and support.
`

  return { proposalName, calls }
}
