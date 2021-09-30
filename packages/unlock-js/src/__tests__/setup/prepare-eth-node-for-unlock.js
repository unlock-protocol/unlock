/* eslint-disable no-console */
const ethers = require('ethers')
const { WalletService } = require('../../../lib/index')
const serverIsUp = require('./serverIsUp')
const Erc20 = require('./deploy-erc20')
const Ether = require('./transfer')

const host = process.env.HTTP_PROVIDER_HOST || '127.0.0.1'
const port = process.env.HTTP_PROVIDER_PORT || 8545
let providerURL = `http://${host}:${port}`

const users = ['0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2']

const log = (message) => {
  console.log(`GANACHE SETUP > ${message}`)
}

// IMPORTANT NOTE
// All non-unlock related deployments and transactions should be done with a signer
// that is not `0` so that we keep the nonces manageable.

// Wait for the node's http endpoint to be up.
serverIsUp(host, port, 1000 /* every second */, 120 /* up to 2 minutes */)
  .then(async () => {
    // Instantiate the walletService
    const walletService = new WalletService({
      31337: {
        provider: providerURL,
      },
    })

    // We connect to a local node and we expect the node to have unlocked accounts
    // which can be used to send transactions
    const provider = new ethers.providers.JsonRpcProvider(providerURL)
    await walletService.connect(provider)

    // Deploy an ERC20
    const erc20Address = await Erc20.deploy(
      walletService.provider,
      await walletService.provider.getSigner(3)
    )
    log(`ERC20 CONTRACT DEPLOYED AT ${erc20Address}`)
    // We then transfer some ERC20 tokens to some users
    await Promise.all(
      users.map(async (user) => {
        await Erc20.transfer(
          walletService.provider,
          await walletService.provider.getSigner(3),
          erc20Address,
          user,
          '500'
        )
        log(`TRANSFERED 500 ERC20 (${erc20Address}) to ${user}`)
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
    log('NODE READY FOR UNLOCK')
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
