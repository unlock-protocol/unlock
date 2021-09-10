/* eslint-disable no-console */

/*
 * This script is meant to be used in dev environment
 * to deploy several contracts on a eth node
 * to make it easy to work with Unlock.
 */

const { ethers } = require('hardhat')
const { WalletService, latest } = require('@unlock-protocol/unlock-js')
const { UnlockDiscountToken } = require('@unlock-protocol/unlock-abi-9')
const Erc20 = require('../lib/deploy-erc20')
const Ether = require('../lib/transfer')
const locks = require('../lib/locks')

const { AddressZero } = ethers.constants

const host = process.env.HTTP_PROVIDER_HOST || '127.0.0.1'
const port = process.env.HTTP_PROVIDER_PORT || 8545

const locksmithHost = process.env.LOCKSMITH_HOST || '127.0.0.1'
const locksmithPort = process.env.LOCKSMITH_PORT || 3000

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
  console.log(`ETH NODE SETUP > ${message}`)
}

async function main() {

  // IMPORTANT NOTE
  // All non-unlock related deployments and transactions should be done with a signer
  // that is not `0` so that we keep the nonces manageable.
  // const [signer] = await ethers.getSigners()

  // Instantiate the walletService
  const walletService = new WalletService({ 
    31337 : { 
      provider: providerURL 
    }
  })
  
  // We connect to a local node and we expect the node to have unlocked accounts
  // which can be used to send transactions
  await walletService.connect(
    ethers.provider
  )

  // Let's transfer some Eth to users
  await Promise.all(
    users.map(async (user) => {
      await Ether.transfer(walletService.provider, 1, user, '10')
      log(`TRANSFERED 10 ETH to ${user}`)
    })
  )


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
  const unlockContract = walletService.unlockAddress
  log(`UNLOCK ${versionName} DEPLOYED AT ${unlockContract}`)

  // Deploy UDT ERC20 
  let [, , deployer, minter, holder] = await ethers.getSigners()
  let udtFactory = new ethers.ContractFactory(
    UnlockDiscountToken.abi,
    UnlockDiscountToken.bytecode,
    deployer
  )
  let udt = await udtFactory.deploy({ gasLimit: 6000000 })
  await udt.deployed()
  await udt.deployTransaction.wait()
  const udtAddress = await udt.address
  log(`UDT DEPLOYED AT ${udtAddress}`)

  // initialize the contract
  await udt['initialize(address)'](minter.address)

  // mint some tokens
  udt = udt.connect(minter)
  await udt.mint(holder.address, 200)

  // Grant Unlock minting permissions
  await udt.addMinter(unlockContract)

  // TODO: deploy Wrapped Eth for unlock!

  // Configure Unlock
  await walletService.configureUnlock({
    publicLockTemplateAddress,
    globalTokenSymbol: 'UDT',
    globalBaseTokenURI: `http://${locksmithHost}:${locksmithPort}/api/key/`,
    unlockDiscountToken: udtAddress,
    wrappedEth: AddressZero,
    estimatedGasForPurchase: 0,
    chainId: 31337
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })