/**
 * Gamma Incentives Round 2
 */
const { ethers } = require('hardhat')

const rewarderAddress = '0xC168131217226cb863D620C0a575b84F7dFfB986'
const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

const rewarderInterface = new ethers.Interface([
  'function notifyRewardAmount(address, uint256)',
  'function setRewardsDuration(address, uint256)',
])

const erc20Interface = new ethers.Interface([
  'function approve(address spender, uint256 amount)',
])

const INCENTIVE_UP_AMOUNT = ethers.parseEther('2222222', 18) // 2,222,222 UP
const INCENTIVE_DURATION = 8 * 7 * 24 * 60 * 60 // 8 weeks in seconds

module.exports = async () => {
  const calls = [
    {
      contractAddress: upTokenAddress,
      calldata: erc20Interface.encodeFunctionData('approve', [
        rewarderAddress,
        INCENTIVE_UP_AMOUNT,
      ]),
    },
    {
      contractAddress: rewarderAddress,
      calldata: rewarderInterface.encodeFunctionData('setRewardsDuration', [
        upTokenAddress,
        INCENTIVE_DURATION,
      ]),
    },
    {
      contractAddress: rewarderAddress,
      calldata: rewarderInterface.encodeFunctionData('notifyRewardAmount', [
        upTokenAddress,
        INCENTIVE_UP_AMOUNT,
      ]),
    },
  ]

  const proposalName =
    'LP Incentives Round 2\n\nThe goal of this proposal is to sustain the existing UP/ETH liquidity until more protocol-owned liquidity can be deployed.\n\n## Details\n\n- Uniswap UP/WETH Pool: https://app.uniswap.org/explore/pools/base/0x9EF81F4E2F2f15Ff1c0C3f8c9ECc636580025242\n- Gamma wide position: https://app.gamma.xyz/vault/uni/base/details/weth-up-3000-wide\n- Using an initial price of UP of $0.0072\n- Total 2,222,222 UP (0.22% of supply) for a two month period\n- Incentives will begin immediately upon execution of this proposal \n\n## Discussion\n\n- Discussion: See \\"DEX selection\\" thread in Discord\n\n## Smart Contract execution\n\nSteps:\n\n1. Approve the rewarder contract to spend 2,222,222 UP. \\`\\"approve(address,uint256)\\" 0xc168131217226cb863d620c0a575b84f7dffb986  2222222000000000000000000\\`\n2. Set the reward time to 8 weeks (in seconds). \\`\\"setRewardsDuration(address, uint256)\\" 0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187 4838400\\`\n3. Call notifyRewardAmount to start incentives. \\`\\"notifyRewardAmount(address, uint256)\\"  0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187 2222222000000000000000000\\`'

  return {
    proposalName,
    calls,
  }
}
