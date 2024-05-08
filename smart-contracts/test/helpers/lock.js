const { ethers } = require('hardhat')
const {
  getEvent,
  getEvents,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')
const DEFAULT_KEY_PRICE = ethers.parseEther('0.01')

const purchaseKey = async (
  lock,
  keyOwnerAddress,
  isErc20 = false,
  keyPrice = DEFAULT_KEY_PRICE
) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    await lock.getAddress()
  )

  // get ethers signer
  const keyOwner = await ethers.getSigner(keyOwnerAddress)
  const purchaseArgs = [
    isErc20 ? [keyPrice] : [],
    [keyOwnerAddress],
    [ADDRESS_ZERO],
    [ADDRESS_ZERO],
    ['0x'],
  ]
  const tx = await lock.connect(keyOwner).purchase(...purchaseArgs, {
    value: isErc20 ? 0 : keyPrice,
  })

  // get token ids
  const receipt = await tx.wait()
  const { args, blockNumber } = await getEvent(receipt, 'Transfer')
  const { tokenId, from, to } = args

  return { tokenId, blockNumber, from, to, tx }
}

const purchaseKeys = async (lock, nbOfKeys = 1n, isErc20 = false, signer) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    await lock.getAddress()
  )

  // signer 0 is the lockOwner so keyOwners starts at index 1
  const signers = await ethers.getSigners()
  const end =
    typeof nbOfKeys === 'number'
      ? nbOfKeys + 1
      : parseInt((nbOfKeys + 1n).toString())
  const keyOwners = signers.slice(1, end)

  if (signer) {
    lock = lock.connect(signer)
  }
  const purchaseArgs = [
    isErc20 ? keyOwners.map(() => DEFAULT_KEY_PRICE) : [],
    await Promise.all(keyOwners.map((keyOwner) => keyOwner.getAddress())),
    keyOwners.map(() => ADDRESS_ZERO),
    keyOwners.map(() => ADDRESS_ZERO),
    keyOwners.map(() => '0x'),
  ]
  const tx = await lock.purchase(...purchaseArgs, {
    value: isErc20 ? 0 : DEFAULT_KEY_PRICE * BigInt(nbOfKeys),
  })
  // get token ids
  const receipt = await tx.wait()
  const { events, blockNumber } = await getEvents(receipt, 'Transfer')
  const tokenIds = events.map(({ args }) => args.tokenId)

  return {
    tokenIds,
    keyOwners: keyOwners.map(({ address }) => address),
    tx,
    blockNumber,
  }
}

module.exports = {
  purchaseKey,
  purchaseKeys,
  DEFAULT_KEY_PRICE,
}
