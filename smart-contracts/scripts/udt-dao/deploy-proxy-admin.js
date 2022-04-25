const { ethers, upgrades, network } = require('hardhat')
const { UNLOCK_MULTISIG_ADDRESS } = require('../../helpers/multisig')
const { impersonate } = require('../../test/helpers/mainnet')
const gov = require('../gov')
const newProxyAdminABI = require('../../test/helpers/ABIs/proxy.json')

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
    const [deployer, proposer] = await ethers.getSigners()
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

    // bring default voting period to 10 blocks for testing purposes
    await network.provider.send('hardhat_setStorageAt', [
      govAddress,
      '0x1c7', // '455' storage slot
      '0x0000000000000000000000000000000000000000000000000000000000000032', // 50 blocks
    ])

    const proposal = {
      contractAbi: newProxyAdminABI,
      contractAddress: newProxyAdmin.address,
      functionName: 'upgrade',
      functionArgs: [udtAddress, newImpl],
      // randomized proposal name to prevent duplicates
      proposalName: `#${Math.floor(Math.random() * 10000)} UDT upgrade`,
      proposerAddress: proposer.address,
    }

    await gov({ proposal })
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
