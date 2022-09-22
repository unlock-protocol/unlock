/* eslint-disable no-console */

/*
 * This script is meant to be used in dev environment
 * to deploy several contracts on a eth node
 * to make it easy to work with Unlock.
 */

import { ethers, unlock } from 'hardhat'

import { deployErc20, outputSubgraphNetworkConf } from '../lib'
import locksArgs from '../lib/locks'

const { AddressZero } = ethers.constants

const locksmithHost = process.env.LOCKSMITH_HOST || '127.0.0.1'
const locksmithPort = process.env.LOCKSMITH_PORT || 3000

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
  const [deployer, holder] = await ethers.getSigners()

  /**
   * 1. Transfer some ETH to users
   */
  await Promise.all(
    users.map((user) =>
      deployer.sendTransaction({
        to: user,
        value: ethers.utils.parseEther('5.0'),
      })
    )
  )

  log(`TRANSFERED 10 ETH to ${users.toString()}`)

  // Deploy an ERC20
  const erc20 = await deployErc20()
  log(`ERC20 CONTRACT DEPLOYED AT ${erc20.address}`)
  const decimals = await erc20.decimals()

  // We then transfer some ERC20 tokens to some users
  await Promise.all(
    users.map(async (user) => {
      const mintTx = await erc20.mint(
        user,
        ethers.utils.parseUnits('500', decimals)
      )
      log(`TRANSFERED 500 ERC20 (${erc20.address}) to ${user}`)
      return await mintTx.wait()
    })
  )

  /**
   * 2. Deploy UDT
   */
  const udt = await deployErc20()
  log(`UDT DEPLOYED AT ${udt.address}`)

  // mint some tokens
  await udt.mint(holder.address, 200)

  /**
   * 3. Deploy UNLOCK contracts
   */
  const { unlock: unlockContract } = await unlock.deployProtocol()
  log('UNLOCK PROTOCOL DEPLOYED')

  // grant Unlock minting permissions
  await udt.addMinter(unlockContract.address)

  // TODO: deploy Wrapped Eth for unlock!

  // Configure Unlock
  await unlockContract.configUnlock(
    udt.address,
    AddressZero, // wrappedEth
    16000,
    'UDT',
    `http://${locksmithHost}:${locksmithPort}/api/key/`,
    31337
  )
  log('UNLOCK CONFIGURED')

  /**
   * 3. Create locks
   */
  // Finally, deploy locks and for each of them, if it's an ERC20, approve it for locksmith purchases
  await Promise.all(
    locksArgs(erc20.address).map(async (lockParams) => {
      const { lock } = await unlock.createLock(lockParams)

      log(`LOCK "${await lockParams.name}" DEPLOYED TO ${lock.address}`)

      if (lockParams.tokenAddress && process.env.LOCKSMITH_PURCHASER_ADDRESS) {
        const purchaser = await ethers.getSigner(
          process.env.LOCKSMITH_PURCHASER_ADDRESS
        )
        const approveTx = await erc20
          .connect(purchaser)
          .approve(lock.address, ethers.utils.parseUnits('500', decimals))
        await approveTx.wait()
      }
      return lock
    })
  )

  // replace subraph conf
  await outputSubgraphNetworkConf(unlockContract.address)

  // Mark the node as ready by sending 1 WEI to the address 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 which is KECCAK256(UNLOCKREADY)
  // This way, any test or application which requires the node to be completely set can just wait for the balance of 0xa3056617a6f63478ca68a890c0d28b42f4135ae4 to be >0.
  // await Ether.transfer(
  //   walletService.provider,
  //   1, // Use the same signer for all Ether transfers
  //   '0xa3056617a6f63478ca68a890c0d28b42f4135ae4',
  //   '0.000000000000000001'
  // )
  // log('NODE READY FOR UNLOCK')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
