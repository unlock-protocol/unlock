const { ethers } = require('hardhat')
const { AddressZero } = ethers.constants
const contracts = require('@unlock-protocol/contracts')

async function main({ lockAddress, to: _recipient, lockVersion }) {
  const [signer] = await ethers.getSigners()
  const recipient = _recipient || signer.address

  // get lock contract
  let Lock
  if (lockVersion) {
    Lock = await ethers.getContractFactory('PublicLock')
  } else {
    const { abi, bytecode } = contracts[`PublicLockV${lockVersion}`]
    Lock = await ethers.getContractFactory(abi, bytecode)
  }
  const lock = Lock.attach(lockAddress)

  // purchase a bunch of keys
  console.log('LOCK PURCHASE > Buying a key...')
  const keyPrice = (await lock.keyPrice()).toString()
  const isErc20 = (await lock.tokenAddress()) !== AddressZero

  // multiple purchases was introduced in v11
  let tx
  if (lockVersion >= 10) {
    tx = await lock.purchase(
      isErc20 ? [keyPrice] : [],
      [recipient],
      [AddressZero],
      [AddressZero],
      [[]],
      {
        value: isErc20 ? 0 : keyPrice,
      }
    )
  } else {
    tx = lock.purchase(keyPrice, recipient, AddressZero, AddressZero, [], {
      value: keyPrice,
    })
  }

  // get token ids
  const { events } = await tx.wait()
  const {
    args: { to, tokenId },
  } = events.find(({ event }) => event === 'Transfer')
  console.log(`LOCK PURCHASE > key (${tokenId}) purchased by ${to}`)
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
