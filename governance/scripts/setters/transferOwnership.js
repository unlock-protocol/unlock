const { ethers } = require('hardhat')
const getOwners = require('../multisig/owners')
const submitTx = require('../multisig/submitTx')
const yesno = require('yesno')

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

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

async function main({ contractAddress, newOwner }) {
  const {
    multisig,
    explorer: {
      urls: { address },
    },
  } = await getNetwork()
  newOwner = newOwner || multisig

  if (!newOwner) {
    throw Error('TRANSFER > missing safe address')
  }

  if (!contractAddress) {
    throw Error('TRANSFER > missing contract address')
  }

  // get contract
  const [signer] = await ethers.getSigners()
  const contract = await ethers.getContractAt(abi, contractAddress, signer)

  const previousOwner = await contract.owner()

  // check if previous owner is a multisig
  let isMultisig = false
  try {
    const currentMultisigOwners = await getOwners({
      safeAddress: previousOwner,
    })
    isMultisig = true
    console.log(
      `> The current owner is a multisig (${currentMultisigOwners.length} owners)`
    )
  } catch {
    console.log(
      `> The current owner is not a multisig : ${address(previousOwner)} \n`
    )
  }

  let multisigOwners
  try {
    multisigOwners = await getOwners({ safeAddress: newOwner })
    console.log(
      `> The new owner is a multisig (${multisigOwners.length} owners)`
    )
  } catch {
    console.log(`⚠️: The new owner is not a multisig : ${address(newOwner)}`)
  }

  console.log(
    `TRANSFER > Changing contract (${contractAddress}) ownership from ${previousOwner} to ${newOwner}`
  )
  const ok = await yesno({
    question: 'Are you sure you want to continue?',
  })

  if (ok) {
    if (isMultisig) {
      // submit a tx to the multisig
      const txArgs = {
        safeAddress: previousOwner,
        tx: {
          contractAddress: contractAddress,
          functionName: 'transferOwnership', // just for explainer
          functionArgs: [newOwner], // just for explainer
          value: 0, // ETH value
          calldata: contract.interface.encodeFunctionData('transferOwnership', [
            newOwner,
          ]),
        },
        // signer,
      }
      const transactionId = await submitTx(txArgs)
      console.log(
        `TRANSFER > Contract ownership tx sent to multisig (id: ${transactionId}).`
      )
    } else {
      const tx = await contract.transferOwnership(newOwner)
      const { transactionHash } = await tx.wait()
      console.log(
        `TRANSFER > Contract ownership transferred (tx: ${transactionHash}).`
      )
    }
  } else {
    console.log('Transfer aborted.')
  }
}

module.exports = main
