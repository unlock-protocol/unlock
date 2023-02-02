const contracts = require('@unlock-protocol/contracts')
const { config, ethers, run } = require('hardhat')
const { TASK_COMPILE } = require('hardhat/builtin-tasks/task-names')
const path = require('path')
const fs = require('fs-extra')
const { abi : proxyAbi, bytecode: proxyBytecode } = require('./ABIs/TransparentUpgradeableProxy.json')
const { abi : proxyAdminAbi, bytecode: proxyAdminBytecode } = require('./ABIs/ProxyAdmin.json')

const { LATEST_UNLOCK_VERSION } = require('../helpers/constants')

// files path
const CONTRACTS_PATH = path.resolve(
  config.paths.root,
  'contracts',
  'past-versions'
)
const ARTIFACTS_PATH = path.resolve(
  config.paths.root,
  'artifacts',
  'past-versions'
)

function getUnlockVersionNumbers() {
  return (
    Array(LATEST_UNLOCK_VERSION)
      .fill(0)
      .map((_, i) => i)
      // skip the contracts before v6
      .filter((v) => v > 5)
  )
}

// returns the latest PublicLock version number corresponding to a version of Unlock
function getMatchingLockVersion(unlockVersion) {
  // before Unlock v10, unlock version equals lock version
  const publicLockVersions = getUnlockVersionNumbers().reduce(
    (acc, v) => ({
      ...acc,
      [v]: v,
    }),
    {}
  )
  // after v10, they start decoupling
  publicLockVersions[10] = 9
  publicLockVersions[11] = 10

  return publicLockVersions[unlockVersion]
}



async function getContractFactoryFromSolFiles(contractName, versionNumber) {
  // copy contract file
  await fs.copy(
    require.resolve(
      `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${versionNumber}.sol`
    ),
    path.resolve(CONTRACTS_PATH, `${contractName}V${versionNumber}.sol`)
  )
  // Recompile
  await run(TASK_COMPILE, { quiet: true })
  // return factory
  return await ethers.getContractFactory(
    `contracts/past-versions/${contractName}V${versionNumber}.sol:${contractName}`
  )
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
  await impl.deployTransaction.wait()
  
  // encode initializer data
  const fragment = impl.interface.getFunction(initializer)
  const data = impl.interface.encodeFunctionData(fragment, initializerArguments)

  // deploy proxyAdmin
  const ProxyAdmin = await ethers.getContractFactory(
    proxyAdminAbi,
    proxyAdminBytecode
  )
  const proxyAdmin = await ProxyAdmin.deploy()
  await proxyAdmin.deployTransaction.wait()

  // deploy proxy
  const TransparentUpgradeableProxy = await ethers.getContractFactory(
    proxyAbi,
    proxyBytecode
  )
  const proxy = await TransparentUpgradeableProxy.deploy(
    impl.address, 
    proxyAdmin.address, 
    data
  )
  await proxy.deployTransaction.wait()

  // wait for proxy deployment
  const contract = await ethers.getContractAt(Factory.interface.format(ethers.utils.FormatTypes.full), proxy.address)
  return {
    proxyAdmin,
    contract 
  }
}

async function upgradeUpgreadableContract( 
  proxyAddress,
  proxyAdminAddress,
  Factory,
) {
  // deploy implementation
  const impl = await Factory.deploy()
  await impl.deployTransaction.wait()

  // get proxyAdmin
  const proxyAdmin = await ethers.getContractAt(
    proxyAdminAbi,
    proxyAdminAddress
  )

  // do the upgrade
  await proxyAdmin.upgrade(proxyAddress, impl.address)

  const upgraded = await ethers.getContractAt(Factory.interface.format(ethers.utils.FormatTypes.full), proxyAddress)
  return upgraded
}


async function getContractFactoryFromSolFiles(contractName, versionNumber) {
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

async function cleanupPastContracts() {
  await fs.remove(CONTRACTS_PATH)
  await fs.remove(ARTIFACTS_PATH)
}

module.exports = {
  getContractAtVersion,
  getUnlockVersionNumbers,
  getMatchingLockVersion,
  getContractFactoryAtVersion,
  getContractFactoryFromSolFiles,
  cleanupPastContracts,
  deployUpgreadableContract,
  upgradeUpgreadableContract,
}
