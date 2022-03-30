/* eslint-disable no-console */
const { ethers } = require('hardhat')
const { WalletService } = require('../../../dist/index')

const Erc20 = require('./deploy-erc20')
const Ether = require('./transfer')

// IMPORTANT NOTE
// All non-unlock related deployments and transactions should be done with a signer
// that is not `0` so that we keep the nonces manageable.

// Wait for the node's http endpoint to be up.
async function main() {
  // Instantiate the walletService
  const walletService = new WalletService({
    31337: {},
  })

  await walletService.connect(ethers.provider)

  // Deploy an ERC20
  const erc20Address = await Erc20.deploy(
    walletService.provider,
    await walletService.provider.getSigner(3)
  )

  // We then transfer some ERC20 tokens to some users
  const users = await ethers.getSigners()
  await Promise.all(
    users.slice(0, 3).map(async ({ address: userAddress }) => {
      await Erc20.transfer(
        walletService.provider,
        await walletService.provider.getSigner(3),
        erc20Address,
        userAddress,
        '500'
      )
      return Promise.resolve()
    })
  )

  // Mark the node as ready by sending 1 WEI to the address 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 which is KECCAK256(UNLOCKREADY)
  // This way, any test or application which requires the ganache to be completely set can just wait for the balance of 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 to be >0.
  await Ether.transfer(
    walletService.provider,
    await walletService.provider.getSigner(1), // Use the same signer for all Ether transfers
    '0xa3056617a6f63478ca68a890c0d28b42f4135ae4',
    '0.000000000000000001'
  )

  return erc20Address
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
