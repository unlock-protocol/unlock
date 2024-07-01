// https://github.com/pcaversaccio/create2deployer
const { ethers } = require('hardhat')
const {
  abi: TransparentUpgradeableProxynAbi,
  bytecode: TransparentUpgradeableProxyBytecode,
} = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json')
const {
  abi: ProxyAdminAbi,
  bytecode: ProxyAdminBytecode,
} = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json')

const create2Addr = '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2' // same on all chains

const create2DeployerAbi = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes32', name: 'codeHash', type: 'bytes32' },
    ],
    name: 'computeAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes32', name: 'codeHash', type: 'bytes32' },
      { internalType: 'address', name: 'deployer', type: 'address' },
    ],
    name: 'computeAddressWithDeployer',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes', name: 'code', type: 'bytes' },
    ],
    name: 'deploy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
    ],
    name: 'deployERC1820Implementer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
]

async function main() {
  const ProxyAdmin = await ethers.getContractFactory(
    ProxyAdminAbi,
    ProxyAdminBytecode
  )
  const TransparentUpgradeableProxy = await ethers.getContractFactory(
    TransparentUpgradeableProxynAbi,
    TransparentUpgradeableProxyBytecode
  )

  const Implementation = await ethers.getContractFactory('Dummy')

  const salt = ethers.id('Unlock Salt 0')
  const initialOwner = '0xD0867C37C7Fc80b2394d4E3f5050D1ed2d0EC03e'

  // get contract
  const create2Deployer = await ethers.getContractAt(
    create2DeployerAbi,
    create2Addr
  )

  // deploy implementation
  const implCreationBytecode = await Implementation.getDeployTransaction(12n)
  const implInitCodehash = ethers.keccak256(implCreationBytecode.data)

  // get impl address
  console.log({ salt, implInitCodehash })
  const implComputedAddress = await create2Deployer.computeAddress(
    salt,
    implInitCodehash
  )

  // deploy a proxy admin
  const proxyAdminCreationBytecode =
    await ProxyAdmin.getDeployTransaction(initialOwner)
  const proxyAdminInitCodehash = ethers.keccak256(
    proxyAdminCreationBytecode.data
  )
  console.log({ salt, proxyAdminInitCodehash })

  // get proxy admin address
  const proxyAdminComputedAddress = await create2Deployer.computeAddress(
    salt,
    proxyAdminInitCodehash
  )

  // actual proxy deployment
  const transparentProxyCreationBytecode =
    await TransparentUpgradeableProxy.getDeployTransaction(
      implComputedAddress, // logic
      proxyAdminComputedAddress, //admin
      '0x' // data if necessary
    )
  const transparentProxyInitCodehash = ethers.keccak256(
    transparentProxyCreationBytecode.data
  )

  const transparentProxyComputedAddress = await create2Deployer.computeAddress(
    salt,
    transparentProxyInitCodehash
  )

  console.log({
    implComputedAddress,
    proxyAdminComputedAddress,
    transparentProxyComputedAddress,
  })
  return transparentProxyComputedAddress

  // const tx = await create2Deployer.deploy(0, salt, creationBytecode.data)
  // const receipt = await tx.wait()
  // console.log(receipt)
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
