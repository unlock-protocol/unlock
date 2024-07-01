/**
 * This will deploy a proxied contract and a proxy admin using CREATE2
 *
 * Relies on https://github.com/pcaversaccio/create2deployer
 */

const { ethers, run, upgrades } = require('hardhat')
const {
  getNetwork,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')
const {
  abi: TransparentUpgradeableProxyAbi,
  bytecode: TransparentUpgradeableProxyBytecode,
} = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json')
const {
  abi: ProxyAdminAbi,
  bytecode: ProxyAdminBytecode,
} = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts-v5/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json')

// same on all chains
const CREATE2_DEPLOYER_ADDRESS = '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2'

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

async function main({
  contractName = 'UPToken',
  subfolder = 'UP',
  deploy = true,
  salt = ethers.id('Unlock Salt z'),
} = {}) {
  const {
    name,
    id,
    unlockDaoToken: { address: udtAddress },
  } = await getNetwork()
  console.log(`Deploying ${contractName} using CREATE2 on ${name} (${id})...`)

  // get address
  const [signer] = await ethers.getSigners()
  const initialOwner = await signer.getAddress()
  // const initialOwner = '0xD0867C37C7Fc80b2394d4E3f5050D1ed2d0EC03e'

  // get contract factories
  const ProxyAdmin = await ethers.getContractFactory(
    ProxyAdminAbi,
    ProxyAdminBytecode
  )
  const TransparentUpgradeableProxy = await ethers.getContractFactory(
    TransparentUpgradeableProxyAbi,
    TransparentUpgradeableProxyBytecode
  )

  // get token implementations
  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName, subfolder },
  ])
  const Implementation = await ethers.getContractFactory(qualifiedPath)

  // get CREATE2 deployer
  const create2Deployer = await ethers.getContractAt(
    create2DeployerAbi,
    CREATE2_DEPLOYER_ADDRESS
  )

  // implementation
  const implArgs = []
  const implCreationBytecode = await Implementation.getDeployTransaction(
    ...implArgs
  )
  const implInitCodehash = ethers.keccak256(implCreationBytecode.data)

  // compute impl address
  const implComputedAddress = await create2Deployer.computeAddress(
    salt,
    implInitCodehash
  )

  // proxy admin
  const proxyAdminCreationBytecode =
    await ProxyAdmin.getDeployTransaction(initialOwner)
  const proxyAdminInitCodehash = ethers.keccak256(
    proxyAdminCreationBytecode.data
  )

  // compute proxy admin address
  const proxyAdminComputedAddress = await create2Deployer.computeAddress(
    salt,
    proxyAdminInitCodehash
  )

  // actual proxy
  const proxyArgs = [
    implComputedAddress, // logic
    proxyAdminComputedAddress, //admin
    '0x', // data if necessary
  ]
  const transparentProxyCreationBytecode =
    await TransparentUpgradeableProxy.getDeployTransaction(...proxyArgs)
  const transparentProxyInitCodehash = ethers.keccak256(
    transparentProxyCreationBytecode.data
  )

  // compute transparent proxy address
  const transparentProxyComputedAddress = await create2Deployer.computeAddress(
    salt,
    transparentProxyInitCodehash
  )

  console.log({
    implComputedAddress,
    proxyAdminComputedAddress,
    transparentProxyComputedAddress,
    udtAddress,
  })

  // launch deployment process
  if (deploy) {
    const txProxyAdmin = await create2Deployer.deploy(
      0,
      salt,
      proxyAdminCreationBytecode.data
    )
    const receiptProxyAdmin = await txProxyAdmin.wait()
    console.log(`ProxyAdmin deployed. (tx: ${receiptProxyAdmin.hash})`)
    const txImpl = await create2Deployer.deploy(
      0,
      salt,
      implCreationBytecode.data
    )
    const receiptImpl = await txImpl.wait()
    console.log(`Impl deployed. (tx: ${receiptImpl.hash})`)
    const txProxy = await create2Deployer.deploy(
      0,
      salt,
      transparentProxyCreationBytecode.data
    )
    const receiptProxy = await txProxy.wait()
    console.log(`Transparent deployed. (tx:  ${receiptProxy.hash})`)

    // verify swap contracts
    console.log(`Verify Swap contract`)
    try {
      await run('verify:verify', {
        address: transparentProxyComputedAddress,
      })
    } catch (error) {
      console.log(error)
    }

    // deploy UP Swap contract
    const [swapQualifiedPath] = await copyAndBuildContractsAtVersion(
      __dirname,
      [{ contractName: 'UPSwap', subfolder: 'UP' }]
    )
    const UPSwap = await ethers.getContractFactory(swapQualifiedPath)
    const swap = await upgrades.deployProxy(UPSwap, [udtAddress, initialOwner])
    const swapAddress = await swap.getAddress()
    console.log(`Swap contract deployed at ${swapAddress}`)

    // verify swap contracts
    console.log(`Verify Swap contract...`)
    try {
      await run('verify:verify', {
        address: swapAddress,
      })
    } catch (error) {
      console.log(error)
    }

    // // initialize proxy
    console.log(`Initialize proxy.`)
    const proxy = Implementation.attach(transparentProxyComputedAddress)
    const tx = await proxy.initialize(initialOwner, swapAddress)
    const { hash } = await tx.wait()
    console.log(`Proxy initialized (tx: ${hash})`)
  }
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
