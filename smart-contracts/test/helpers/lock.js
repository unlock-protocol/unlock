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
  keyPrice
) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    await lock.getAddress()
  )

  if (!keyPrice) {
    keyPrice = await lock.keyPrice()
  }

  // get ethers signer
  const keyOwner = await ethers.getSigner(keyOwnerAddress)
  const purchaseArgs = {
    value: isErc20 ? keyPrice : 0,
    recipient: keyOwnerAddress,
    keyManager: ADDRESS_ZERO,
    referrer: ADDRESS_ZERO,
    protocolReferrer: ADDRESS_ZERO,
    data: '0x',
    additionalPeriods: 0,
  }

  const tx = await lock.connect(keyOwner).purchase([purchaseArgs], {
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
  const keyPrice = await lock.keyPrice()

  const purchaseArgs = keyOwners.map((signer) => ({
    value: isErc20 ? keyPrice : 0n,
    recipient: signer.getAddress(),
    keyManager: ADDRESS_ZERO,
    referrer: ADDRESS_ZERO,
    protocolReferrer: ADDRESS_ZERO,
    data: '0x',
    additionalPeriods: 0,
  }))

  const tx = await lock.purchase(purchaseArgs, {
    value: isErc20 ? 0 : keyPrice * BigInt(nbOfKeys),
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
