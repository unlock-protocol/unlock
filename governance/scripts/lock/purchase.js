const { ethers } = require('hardhat')
const { ADDRESS_ZERO, getEvent } = require('@unlock-protocol/hardhat-helpers')
const contracts = require('@unlock-protocol/contracts')

async function main({
  lockAddress,
  to: _recipient,
  lockVersion,
  referrer = ADDRESS_ZERO,
  keyManager = ADDRESS_ZERO,
}) {
  const [signer] = await ethers.getSigners()
  const recipient = _recipient || signer.address

  // get lock contract
  const { abi } =
    contracts[lockVersion ? `PublicLockV${lockVersion}` : `PublicLock`]
  const lock = await ethers.getContractAt(abi, lockAddress)

  // purchase a bunch of keys
  console.log('LOCK PURCHASE > Buying a key...')
  const keyPrice = (await lock.keyPrice()).toString()
  const isErc20 = (await lock.tokenAddress()) !== ADDRESS_ZERO

  const args = [
    isErc20 ? [keyPrice] : [],
    [recipient],
    [referrer],
    [keyManager],
    ['0x'],
  ]

  // multiple purchases was introduced in v11
  const tx = await lock.purchase(...args, {
    value: isErc20 ? 0 : keyPrice,
  })
  // get token ids
  const receipt = await tx.wait()
  const {
    args: { to, tokenId },
    hash,
  } = await getEvent(receipt, 'Transfer')

  console.log(
    `LOCK PURCHASE > key (${tokenId}) purchased by ${to} (tx: ${hash})`
  )
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
