/* eslint-disable no-console */

const { WalletService, latest } = require('@unlock-protocol/unlock-js')
const ethers = require('ethers')
const { AddressZero } = require('ethers/constants')
const serverIsUp = require('./utils/serverIsUp')
const Erc1820 = require('./deploy-erc1820')
const Erc20 = require('./deploy-erc20')
const Ether = require('./transfer')
const locks = require('./locks')

/*
 * This script is meant to be used in dev environment to deploy several contract on a ganache instance to make it easy to work with Unlock.
 */
const host = process.env.HTTP_PROVIDER_HOST || '127.0.0.1'
const port = process.env.HTTP_PROVIDER_PORT || 8545

const locksmithHost = process.env.LOCKSMITH_HOST
const locksmithPort = process.env.LOCKSMITH_PORT

const providerURL = `http://${host}:${port}`

const versionName = latest

const users = []
if (process.env.LOCKSMITH_PURCHASER_ADDRESS) {
  users.push(process.env.LOCKSMITH_PURCHASER_ADDRESS)
}

if (process.env.ETHEREUM_ADDRESS) {
  users.push(process.env.ETHEREUM_ADDRESS)
}

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
    const walletService = new WalletService()

    // We connect to a local node and we expect the node to have unlocked accounts
    // which can be used to send transactions
    await walletService.connect(
      new ethers.providers.JsonRpcProvider(providerURL)
    )

    // Let's transfer some Eth to users
    await Promise.all(
      users.map(async (user) => {
        await Ether.transfer(walletService.provider, 1, user, '10')
        log(`TRANSFERED 10 ETH to ${user}`)
      })
    )

    // Deploy ERC1820
    await Erc1820.deploy(walletService.provider, 2)
    log('ERC1820 CONTRACT DEPLOYED')
    // Deploy an ERC20
    const erc20Address = await Erc20.deploy(walletService.provider, 3)
    log(`ERC20 CONTRACT DEPLOYED AT ${erc20Address}`)
    // We then transfer some ERC20 tokens to some users
    await Promise.all(
      users.map(async (user) => {
        await Erc20.transfer(
          walletService.provider,
          3,
          erc20Address,
          user,
          '500'
        )
        log(`TRANSFERED 500 ERC20 (${erc20Address}) to ${user}`)
        return Promise.resolve()
      })
    )

    // Deploy the template contract
    const publicLockTemplateAddress = await walletService.deployTemplate(
      versionName
    )
    log(`TEMPLATE CONTRACT DEPLOYED AT ${publicLockTemplateAddress}`)

    // Then, we deploy Unlock!
    await walletService.deployUnlock(versionName)
    const unlockContract = walletService.unlockContractAddress
    log(`UNLOCK ${versionName} DEPLOYED AT ${unlockContract}`)

    // TODO: deploy ERC20 for unlock!
    // TODO: deploy Wrapped Eth for unlock!

    // Configure Unlock
    await walletService.configureUnlock({
      publicLockTemplateAddress,
      globalTokenSymbol: 'UDT',
      globalBaseTokenURI: `http://${locksmithHost}:${locksmithPort}/api/key/`,
      unlockDiscountToken: AddressZero,
      wrappedEth: AddressZero,
      estimatedGasForPurchase: 0,
    })
    log('UNLOCK CONFIGURED')

    // Finally, deploy locks and for each of them, if it's an ERC20, approve it for locksmith purchases
    const promises = locks({
      erc20Address,
    }).map(async (lock) => {
      const lockAddress = await walletService.createLock(lock)
      log(`${lock.name.toUpperCase()} DEPLOYED AT ${lockAddress}`)
      if (
        lock.currencyContractAddress &&
        process.env.LOCKSMITH_PURCHASER_ADDRESS
      ) {
        await Erc20.approve(
          walletService.provider,
          erc20Address,
          '500',
          process.env.LOCKSMITH_PURCHASER_ADDRESS,
          lockAddress
        )
        log(
          `LOCK ${lockAddress} APPROVED TO WITHDRAW ${erc20Address} FROM PURCHASER ${process.env.LOCKSMITH_PURCHASER_ADDRESS}`
        )
        return Promise.resolve()
      }
      return lockAddress
    })

    await Promise.all(promises)

    // Mark the node as ready by sending 1 WEI to the address 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 which is KECCAK256(UNLOCKREADY)
    // This way, any test or application which requires the ganache to be completely set can just wait for the balance of 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 to be >0.
    await Ether.transfer(
      walletService.provider,
      1, // Use the same signer for all Ether transfers
      '0xa3056617a6f63478ca68a890c0d28b42f4135ae4',
      '0.000000000000000001'
    )
    log('NODE READY FOR UNLOCK')
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
