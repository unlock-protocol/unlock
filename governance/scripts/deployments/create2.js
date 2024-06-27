// https://github.com/pcaversaccio/create2deployer

const { ethers } = require('hardhat')

const create2Addr = '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2' // base sepolia

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
  const Dummy = await ethers.getContractFactory('Dummy')

  const salt = ethers.id('Unlock Salt 0')

  const create2Deployer = await ethers.getContractAt(
    create2DeployerAbi,
    create2Addr
  )

  const creationBytecode = await Dummy.getDeployTransaction(12n)
  const initCodehash = ethers.keccak256(creationBytecode.data)

  const onChainComputed = await create2Deployer.computeAddress(
    salt,
    initCodehash
  )

  const offChainComputed = ethers.getCreate2Address(
    create2Addr,
    salt,
    initCodehash
  )

  return onChainComputed

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
