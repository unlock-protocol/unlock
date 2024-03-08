/**
 * This is a script to upgrade the protocol by sending to multisig
 * the instructions to upgrade Unlock proxy and set a new PublickLock template
 *
 * TODO:
 * - make addresses list programmatic (using deployment tasks directly)
 */

const { ethers } = require('hardhat')
const {
  getNetwork,
  getProxyAdminAddress,
} = require('@unlock-protocol/hardhat-helpers')
const { submitTx } = require('../multisig')

const { UnlockV13, PublicLockV14 } = require('@unlock-protocol/contracts')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

// addresses
const deployedContracts = {
  1: {
    unlockSwapBurner: '0x316A4650e70594FA3D947a43A237bEF427Bd80d6',
    unlockImplAddress: '0xd8250925527e769d90C6F2Fc55384B9110f26b62',
    publicLockAddress: '0xc9577b38ADA2B1b251EE99e54cC399027d547B68',
  },
  10: {
    publicLockAddress: '0x530Ff2dAED410cA7D70C25f18dc770f106201151',
    unlockImplAddress: '0x508619074f542b6544c5835f260CC704E988cf65',
  },
  56: {
    publicLockAddress: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
    unlockImplAddress: '0xfe9fD6af67E48D9f05Aa88679Ac294E3f28532eE',
  },
  100: {
    // verif files (Error Details: Missing or invalid ApiKey)
    publicLockAddress: '0xeAd6d1877452383ab5F74c689b6C3d0538Fd3008', // not verified
    unlockImplAddress: '0x24BF5517Ecc83caB64478Ab3D69950aA1567eB89', // not verified
  },
  137: {
    publicLockAddress: '0x8231d6fD0221C01FCAc5827EdD20D1aeC28EeBe3',
    unlockImplAddress: '0x4132f269168375DBf7DcDb2cfEA348F453FD4B40',
    unlockSwapBurner: '0x9B538FE47e7BE0F5D10F9dD277F63B27b5a9c69f',
  },
  42161: {
    // arbitrum
    publicLockAddress: '0x04664b4290fa1F4001ED25d9576f7C2d980aC64d',
    unlockImplAddress: '0xe49f5FD63cD7ec130B07dad30f068CC08F201e1e',
  },
  43114: {
    // avalanche
    unlockImplAddress: '0x7E33dD3955b7B4a699CE75D507bfB2f044D5Df87',
    publicLockAddress: '0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591',
  },
  8453: {
    // avalanche
    unlockImplAddress: '0x70cBE5F72dD85aA634d07d2227a421144Af734b3',
    publicLockAddress: '0x64A3328Cf61025720c26dE2a87B6d913fA6e376a',
  },
  42220: {
    unlockImplAddress: '0xA8BB5AF09B599794136B14B112e137FAf83Acf1f',
    publicLockAddress: '0xF241F12506fb6Bf1909c6bC176A199166414007a',
  },
  59144: {
    unlockImplAddress: '0x36b34e10295cCE69B652eEB5a8046041074515Da',
    publicLockAddress: '0xA5978Df9a664C56d62313EE9EAaC7930977164E4',
  },
  5: {
    unlockImplAddress: '0x6CbD17331Aef9073502Fdb55eEbd8e90f39497bd',
    publicLockAddress: '0x58aAe2B6B31D3Ce1597c419c5917EE224974Da5B',
  },
  80001: {
    unlockImplAddress: '0x32Eb84EbDFB89A7957c86ec4396bae489Cfe4549',
    publicLockAddress: '0x316A4650e70594FA3D947a43A237bEF427Bd80d6',
  },
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

async function main() {
  const { id, multisig, unlockAddress } = await getNetwork()
  const { unlockImplAddress, publicLockAddress } = deployedContracts[id]

  let [signer] = await ethers.getSigners()

  // submit template to Unlock
  const unlock = await ethers.getContractAt(UnlockV13.abi, unlockAddress)
  const { interface: unlockInterface } = unlock
  const template = await ethers.getContractAt(
    PublicLockV14.abi,
    publicLockAddress
  )

  const unlockVersion = await unlock.unlockVersion()
  const publicLockVersion = await template.publicLockVersion()

  // submit Unlock upgrade
  const proxyAdminAddress = await getProxyAdminAddress({ chainId: id })
  const { interface: proxyAdminInterface } = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )

  console.log(`Submitting contract upgrade on chain ${id}: 
  - unlock proxy: ${unlockAddress}
  - proxyAdmin: ${proxyAdminAddress}
  - unlock impl: ${unlockImplAddress}
  - publicLock: ${publicLockAddress}
  - multisig: ${multisig}
  - signer: ${signer.address}
  `)

  // check versions are correct in all contracts
  assert(unlockVersion === 12n, 'Wrong actual unlockVersion')
  assert(
    (await unlock.publicLockLatestVersion()) === 13n,
    'Wrong actual publicLockVersion'
  )
  assert(
    (await (
      await ethers.getContractAt(UnlockV13.abi, unlockImplAddress)
    ).unlockVersion()) === 13n,
    'Wrong new unlockVersion'
  )
  assert(publicLockVersion === 14n, 'Wrong new publicLockVersion')
  const unlockOwmer = await unlock.owner()
  assert(unlockOwmer === multisig, `Owner ${unlockOwmer} is not a multisig`)

  // upgrade first so we dont have a revert when
  // template is initialized
  const calls = [
    {
      contractAddress: proxyAdminAddress,
      explainer: `upgrade(${unlockAddress},${unlockImplAddress})`,
      calldata: proxyAdminInterface.encodeFunctionData('upgrade', [
        unlockAddress,
        unlockImplAddress,
      ]),
    },
    {
      contractAddress: unlockAddress,
      explainer: `addLockTemplate(${publicLockAddress},${publicLockVersion})`,
      calldata: unlockInterface.encodeFunctionData('addLockTemplate', [
        publicLockAddress,
        publicLockVersion,
      ]),
    },
    {
      contractAddress: unlockAddress,
      explainer: `setLockTemplate(${publicLockAddress})`,
      calldata: unlockInterface.encodeFunctionData('setLockTemplate', [
        publicLockAddress,
      ]),
    },
  ]

  // submit the calls to the multisig
  const txArgs = {
    safeAddress: multisig,
    tx: calls,
  }
  console.log(txArgs)
  await submitTx(txArgs)
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
