/* eslint-disable no-console */
const { ethers } = require('hardhat')
const { tokens } = require('hardlydifficult-ethereum-contracts')
const createLockHash = require('../test/helpers/createLockCalldata')

const useHardlyDifficult = true
const unlockAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'

const erc20Abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'MinterAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'MinterRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'addMinter',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'isMinter',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'renounceMinter',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

function delay(n) {
  return new Promise(function (resolve) {
    setTimeout(resolve, n * 1000)
  })
}

const keyPrice = 100000000
async function main() {
  const [signer, keyOwner] = await ethers.getSigners()
  const unlock = await ethers.getContractAt('Unlock', unlockAddress)

  let erc20
  if (useHardlyDifficult) {
    const testToken = await tokens.dai.deploy(web3, signer.address)
    erc20 = await ethers.getContractAt(erc20Abi, testToken.address, signer)
  } else {
    const Erc20 = await ethers.getContractFactory('TestErc20PausableToken')
    erc20 = await Erc20.deploy()
    await erc20.deployed()
  }

  await erc20.mint(signer.address, keyPrice * 1000)
  await erc20.mint(keyOwner.address, keyPrice * 1000)

  // create a lock
  const lockParams = {
    expirationDuration: 10, // 10s
    tokenAddress: erc20.address,
    keyPrice,
    maxNumberOfKeys: 100,
    name: 'my lock',
  }
  const calldata = await createLockHash({
    args: Object.values(lockParams),
    from: signer.address,
  })
  const txCreateLock = await unlock.createUpgradeableLockAtVersion(calldata, 11)

  const { events, transactionHash } = await txCreateLock.wait()
  const { args: argsLock } = events.find(({ event }) => event === 'NewLock')
  const { newLockAddress } = argsLock

  // eslint-disable-next-line no-console
  console.log(
    `LOCK DEPLOY > deployed to : ${newLockAddress} (tx: ${transactionHash})`
  )

  const lock = await ethers.getContractAt('PublicLock', newLockAddress)
  console.log(await lock.name())

  // mint some tokens for the lock
  await erc20.mint(lock.address, keyPrice * 1000)

  // approve
  await erc20.approve(lock.address, keyPrice * 10000)
  await erc20.connect(keyOwner).approve(lock.address, keyPrice * 10000)

  console.log(await erc20.allowance(signer.address, lock.address))
  console.log(await erc20.allowance(keyOwner.address, lock.address))
  console.log(await erc20.allowance(lock.address, keyOwner.address))

  // set gas refund
  const gasRefundValue = 150000
  const txGas = await lock.setGasRefundValue(gasRefundValue)
  await txGas.wait()
  console.log(await lock.gasRefundValue())

  // purchase
  const txBuy = await lock
    .connect(keyOwner)
    .purchase(
      [keyPrice.toString()],
      [keyOwner.address],
      [ethers.constants.AddressZero],
      [ethers.constants.AddressZero],
      [[]]
    )
  const buyReceipt = await txBuy.wait()
  const { args: buyArgs } = buyReceipt.events.find(
    (v) => v.event === 'Transfer'
  )
  const { tokenId } = buyArgs

  // expire key
  console.log(`waiting for key (${tokenId}) to expire...`)
  await delay(11)

  // renew membership
  const tx = await lock
    .connect(signer)
    .renewMembershipFor(tokenId, ethers.constants.AddressZero)
  const receipt = await tx.wait()
  const { args } = receipt.events.find((v) => v.event === 'KeyExtended')
  console.log(args)
  // console.log(receipt)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
