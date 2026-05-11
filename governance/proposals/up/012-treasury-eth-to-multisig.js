/**
 * Treasury Liquidity Management: ETH to USDC Swap Proposal
 *
 * This proposal transfers 3 ETH from the Timelock to the DAO multisig on Base.
 * The multisig will then perform the swap into USDC to ensure operational sustainability.
 */
const { ethers } = require('hardhat')

// DAO Multisig on Base (from networks package)
const DAO_MULTISIG_ADDRESS = '0xf88e5D0A879a709d0B1cB794d5E0b8c61783cA10'
const TRANSFER_AMOUNT = '3' // ETH

module.exports = async ({
  daoMultisigAddress = DAO_MULTISIG_ADDRESS,
  transferAmount = TRANSFER_AMOUNT,
} = {}) => {
  const amount = ethers.parseEther(transferAmount.toString())

  const calls = [
    {
      contractAddress: daoMultisigAddress,
      value: amount,
      calldata: '0x',
    },
  ]

  const proposalName = `Treasury Liquidity Management: 3 ETH Transfer to DAO Multisig for USDC Swap

## Summary
This proposal aims to ensure the sustainability of the Unlock Protocol DAO treasury by increasing available USDC liquidity to cover current and future operational expenses.

## Context
The DAO treasury is currently running low on USDC, which creates a risk for fulfilling approved and upcoming payments, such as Proposal #32333504691908265821196935068686159046240743627403944131571934699080378126681.
At the same time, the DAO holds approximately 10.17 ETH on Base. To prevent liquidity issues and ensure smooth operations, it is necessary to rebalance part of the treasury.

## Proposal
Swap 3 ETH from the treasury into USDC. For execution flexibility, this proposal transfers the 3 ETH to the DAO multisig on Base, which will perform the swap on a DEX.

## Rationale
- Maintain sufficient USDC liquidity for approved and future payments.
- Reduce short-term operational risk.
- Preserve the majority of ETH holdings for long-term exposure.

## Financial Impact (Estimated)
Using ETH price ≈ $2,132.39 USD:
- 3 ETH ≈ 6,397.17 USDC
- Remaining ETH in treasury: ~7.17 ETH

(Note: Final USDC amount will depend on market price and slippage at execution time.)

## Execution Plan
1. Transfer 3 ETH from the Timelock to the DAO multisig on Base.
2. Perform the swap on Base using a trusted DEX (e.g., Uniswap).
3. Ensure minimal slippage and optimal execution.
4. Transfer the acquired USDC to the DAO treasury.

## Conclusion
This proposal provides a simple and low-risk strategy to ensure the DAO maintains sufficient liquidity while preserving most of its ETH exposure. It is a proactive step to support ongoing operations and approved governance decisions.`

  return {
    proposalName,
    calls,
  }
}
