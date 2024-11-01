const contracts = require('@unlock-protocol/contracts')
const { ethers } = require('hardhat')
const {
  abi: proxyAbi,
  bytecode: proxyBytecode,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/TransparentUpgradeableProxy.json')
const {
  abi: proxyAdminAbi,
  bytecode: proxyAdminBytecode,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const LATEST_UNLOCK_VERSION = 14
const LATEST_PUBLIC_LOCK_VERSION = 15

function getUnlockVersionNumbers() {
  return (
    Array(LATEST_UNLOCK_VERSION)
      .fill(0)
      .map((_, i) => i)
      // skip the contracts before v11
      .filter((v) => v > 11)
  )
}

// returns the latest PublicLock version number corresponding to a version of Unlock
function getMatchingLockVersion(unlockVersion) {
  // before Unlock v10, unlock version equals lock version
  const publicLockVersions = {
    // after v10, they start decoupling
    11: 11,
    12: 12,
    13: 14,
    14: 15,
  }
  return publicLockVersions[unlockVersion]
}

async function getContractFactoryAtVersion(contractName, versionNumber) {
  const contractVersion = `${contractName}V${versionNumber}`

  // make sure contract exists
  if (!Object.keys(contracts).includes(contractVersion)) {
    throw Error(
      `Contract '${contractVersion}' is not in present in @unlock-protocol/contracts`
    )
  }

  // get contract factory
  const { bytecode, abi } = contracts[contractVersion]
  const factory = await ethers.getContractFactory(abi, bytecode)
  return factory
}

async function deployUpgreadableContract(
  Factory,
  initializerArguments = [],
  initializer = 'initialize'
) {
  // deploy implementation
  const impl = await Factory.deploy()

  // encode initializer data
  const fragment = impl.interface.getFunction(initializer)
  const data = impl.interface.encodeFunctionData(fragment, initializerArguments)

  // deploy proxyAdmin
  const ProxyAdmin = await ethers.getContractFactory(
    proxyAdminAbi,
    proxyAdminBytecode
  )
  const proxyAdmin = await ProxyAdmin.deploy()

  // deploy proxy
  const TransparentUpgradeableProxy = await ethers.getContractFactory(
    proxyAbi,
    proxyBytecode
  )
  const proxy = await TransparentUpgradeableProxy.deploy(
    await impl.getAddress(),
    await proxyAdmin.getAddress(),
    data
  )

  // wait for proxy deployment
  const contract = await Factory.attach(await proxy.getAddress())
  return {
    proxyAdmin,
    contract,
  }
}

async function upgradeUpgreadableContract(
  proxyAddress,
  proxyAdminAddress,
  Factory
) {
  // deploy implementation
  const impl = await Factory.deploy()

  // get proxyAdmin
  const proxyAdmin = await ethers.getContractAt(
    proxyAdminAbi,
    proxyAdminAddress
  )

  // do the upgrade
  await proxyAdmin.upgrade(proxyAddress, await impl.getAddress())

  const upgraded = await Factory.attach(proxyAddress)
  return upgraded
}

async function getContractAtVersion(
  contractName,
  versionNumber,
  contractAddress
) {
  return await ethers.getContractAt(
    `contracts/past-versions/${contractName}V${versionNumber}.sol:${contractName}`,
    contractAddress
  )
}

module.exports = {
  LATEST_UNLOCK_VERSION,
  LATEST_PUBLIC_LOCK_VERSION,
  getContractAtVersion,
  getUnlockVersionNumbers,
  getMatchingLockVersion,
  getContractFactoryAtVersion,
  deployUpgreadableContract,
  upgradeUpgreadableContract,
}
