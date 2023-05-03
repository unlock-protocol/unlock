/* eslint-disable no-console */
import { ethers } from 'ethers'
import { getSigners, transferETH } from './provider'
import Erc20 from './erc20'

// IMPORTANT NOTE
// All non-unlock related deployments and transactions should be done with a signer
// that is not `0` so that we keep the nonces manageable.

// Wait for the node's http endpoint to be up.
export default async function () {
  const signers = await getSigners()

  // Deploy an ERC20
  const erc20 = await Erc20.deploy(signers[3])
  const erc20Address = erc20.address

  // We then transfer some ERC20 tokens to some users
  await Promise.all(
    signers.slice(0, 3).map(async ({ address: userAddress }) => {
      await Erc20.transfer(signers[3], erc20Address, userAddress, '500')
      return Promise.resolve()
    })
  )

  // Mark the node as ready by sending 1 WEI to the address 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 which is KECCAK256(UNLOCKREADY)
  // This way, any test or application which requires the ganache to be completely set can just wait for the balance of 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 to be >0.
  await transferETH(
    signers[1], // Use the same signer for all Ether transfers
    '0xa3056617a6f63478ca68a890c0d28b42f4135ae4',
    '0.000000000000000001'
  )

  return erc20
}
