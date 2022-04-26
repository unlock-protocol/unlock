/**
  This script demonstrates how to transfer ownership of the UDT contract to the DAO / Governor contract

  What it does 

  1) deploy a new `ProxyAdmin` 
  2) transfer the ownership of that new `ProxyAdmin` to the `Timelock` (which manages the DAO execution)
  3) change UDT's proxy admin to the new one
  4) perform a small upgrade to the UDT contract through the DAO voting process

  The steps 1-3 are meant to actually deploy the changes on mainnet, while step 4 is a test to be run on a local mainnet fork.

  ### How to run on mainnet

  ```
  export ALCHEMY_API_KEY=<xxx>
  RUN_MAINNET_FORK=1 yarn hardhat run scripts/others/udt-dao-proxy-admin.js
  ```
 */
const { ethers, upgrades, network, run } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { UNLOCK_MULTISIG_ADDRESS } = require('../../helpers/multisig')
const { impersonate } = require('../../test/helpers/mainnet')
const { addUDT, getDictator } = require('../../test/helpers/mainnet')
const newProxyAdminABI = require('../../test/helpers/ABIs/proxy.json')

// import gov tasks
const submit = require('../gov/submit')
const vote = require('../gov/vote')
const queue = require('../gov/queue')
const execute = require('../gov/execute')

const udtProxyAdminABI = JSON.parse(
  '[{"constant":true,"inputs":[{"name":"proxy","type":"address"}],"name":"getProxyImplementation","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"proxy","type":"address"},{"name":"newAdmin","type":"address"}],"name":"changeProxyAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"proxy","type":"address"},{"name":"implementation","type":"address"},{"name":"data","type":"bytes"}],"name":"upgradeAndCall","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"proxy","type":"address"},{"name":"implementation","type":"address"}],"name":"upgrade","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"proxy","type":"address"}],"name":"getProxyAdmin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]'
)

const timeLockAddress = '0x17eedfb0a6e6e06e95b3a1f928dc4024240bc76b'
const udtAddress = '0x90de74265a416e1393a450752175aed98fe11517'
const udtProxyAdminAddress = '0x79918A4389A437906538E0bbf39918BfA4F7690e'
const govAddress = '0x7757f7f21F5Fa9b1fd168642B79416051cd0BB94'

async function main() {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  // eslint-disable-next-line no-console
  if (isDev) console.log('Dev mode ON')

  // deploy proxy admin
  const ProxyAdmin = await ethers.getContractFactory(
    '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin'
  )
  // eslint-disable-next-line no-console
  console.log('ProxyAdmin > deploy new instance...')
  const newProxyAdmin = await ProxyAdmin.deploy()
  await newProxyAdmin.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `ProxyAdmin > deployed to : ${newProxyAdmin.address} (tx: ${newProxyAdmin.deployTransaction.hash})`
  )

  // set proxy admin owner to Timelock
  const tx = await newProxyAdmin.transferOwnership(timeLockAddress)
  const { events } = await tx.wait()
  const transfer = events.find((v) => v.event === 'OwnershipTransferred')

  // eslint-disable-next-line no-console
  console.log(
    `ProxyAdmin > ownership transferred to : ${transfer.args.newOwner} (tx: ${tx.hash})`
  )

  if (isDev && process.env.RUN_MAINNET_FORK) {
    // impersonate multisig
    await impersonate(UNLOCK_MULTISIG_ADDRESS)
    const multisig = await ethers.getSigner(UNLOCK_MULTISIG_ADDRESS)

    // now transfer UDT to new proxy admin
    const udtProxyAdmin = await ethers.getContractAt(
      udtProxyAdminABI,
      udtProxyAdminAddress,
      multisig
    )

    // eslint-disable-next-line no-console
    console.log(
      `ProxyAdmin > current UDT proxyAdmin: ${await udtProxyAdmin.getProxyAdmin(
        udtAddress
      )}`
    )

    const tx2 = await udtProxyAdmin.changeProxyAdmin(
      udtAddress,
      newProxyAdmin.address
    )
    await tx2.wait()

    // eslint-disable-next-line no-console
    console.log(
      `ProxyAdmin > changed. new UDT proxyAdmin: ${await newProxyAdmin.getProxyAdmin(
        udtAddress
      )}`
    )

    // now lets perform an UDT upgrade using the new proxy
    // prepare upgrade and deploy new contract implementation
    const [deployer, proposer, localDictator] = await ethers.getSigners()
    const UnlockDiscountTokenV4 = await ethers.getContractFactory(
      'TestUnlockDiscountTokenV4',
      deployer
    )
    const newImpl = await upgrades.prepareUpgrade(
      udtAddress,
      UnlockDiscountTokenV4,
      {}
    )
    // eslint-disable-next-line no-console
    console.log(`UDT > new UDT v4 impl deployed: ${newImpl}`)

    const quorum = await run('gov:quorum')
    const dictator = !process.env.RUN_MAINNET_FORK
      ? localDictator
      : await getDictator()

    // lower voting delqy and delay period
    await network.provider.send('hardhat_setStorageAt', [
      govAddress,
      '0x1c6', // voting delay - '454' storage slot
      '0x0000000000000000000000000000000000000000000000000000000000000001', // 1 block
    ])

    await network.provider.send('hardhat_setStorageAt', [
      govAddress,
      '0x1c7', // voting period - '455' storage slot
      '0x0000000000000000000000000000000000000000000000000000000000000032', // 50 blocks
    ])

    // Authoritarian mode: delegate UDT to a single voter (aka dictator) to bypass quorum
    // NB: this has to be done *before* proposal submission's block height so votes get accounted for
    await addUDT(proposer.address, quorum * 2)

    // delegate 30k to voter
    const udt = await ethers.getContractAt(
      'UnlockDiscountTokenV3',
      udtAddress,
      proposer
    )
    const tx = await udt.delegate(dictator.address)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'DelegateVotesChanged')
    if (evt) {
      // eslint-disable-next-line no-console
      console.log(
        `GOV VOTE (dev) > ${proposer.address} delegated quorum to ${dictator.address}`,
        `(total votes: ${ethers.utils.formatUnits(
          await udt.getVotes(dictator.address),
          18
        )})`
      )
    }

    // eslint-disable-next-line no-console
    console.log(
      `GOV VOTE (dev) > Dictator votes: ${ethers.utils.formatUnits(
        await udt.getVotes(dictator.address),
        18
      )}`
    )
    await time.advanceBlock()

    const proposal = {
      contractAbi: newProxyAdminABI,
      contractAddress: newProxyAdmin.address,
      functionName: 'upgrade',
      functionArgs: [udtAddress, newImpl],
      // randomized proposal name to prevent duplicates
      proposalName: `#${Math.floor(Math.random() * 10000)} UDT upgrade`,
      proposerAddress: proposer.address,
    }

    // execute proposal
    const proposalId = await submit({ ...proposal })
    await vote({ proposalId }) // no voter address enables authoritarian mode
    await queue({ proposal: { ...proposal, proposalId } })
    await execute({ proposal: { ...proposal, proposalId } })

    // now lets make sure it worked
    const udtUpgraded = await ethers.getContractAt(
      'TestUnlockDiscountTokenV4',
      udtAddress
    )
    const helloWorld = await udtUpgraded.sayHello()
    // eslint-disable-next-line no-console
    console.log(`UDT v4 is saying "${helloWorld}". Upgrade successful!`)
  }
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
