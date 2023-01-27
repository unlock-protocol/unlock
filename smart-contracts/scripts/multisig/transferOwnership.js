const { ethers } = require('hardhat')
const getOwners = require('./owners')
const yesno = require('yesno')

const { networks } = require('@unlock-protocol/networks')

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

async function main({ contractAddress, safeAddress }) {

  const { chainId } = await ethers.provider.getNetwork()
  const { teamMultisig } = networks[chainId]
  if(teamMultisig) { 
    safeAddress = teamMultisig
  }

  if (!safeAddress) {
    throw Error('TRANSFER > missing safe address')
  }

  if (!contractAddress) {
    throw Error('TRANSFER > missing contract address')
  }

  // get contract
  const [signer] = await ethers.getSigners()
  const contract = await ethers.getContractAt(abi, contractAddress, signer)

  const previousOwner = await contract.owner()
  const multisigOwners = await getOwners({ safeAddress })
  console.log(
    `TRANSFER > Changing contract (${contractAddress}) ownership from ${previousOwner} to multisig ${safeAddress} (${multisigOwners.length} owners)`
  )
  const ok = await yesno({
    question: 'Are you sure you want to continue?',
  })

  if (ok) {
    const tx = await contract.transferOwnership(safeAddress)
    const { transactionHash } = await tx.wait()
    console.log(
      `TRANSFER > Contract ownership transferred (tx: ${transactionHash}).`
    )
  } else {
    console.log('Transfer aborted.')
  }
}

module.exports = main
