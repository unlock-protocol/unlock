const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers/constants')

const DEFAULT_KEY_PRICE = ethers.utils.parseEther('0.01')

const purchaseKey = async (
  lock,
  keyOwner,
  isErc20 = false,
  keyPrice = DEFAULT_KEY_PRICE
) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    lock.address
  )

  // get ethers signer
  keyOwner = await ethers.getSigner(keyOwner)

  const tx = await lock
    .connect(keyOwner)
    .purchase(
      isErc20 ? [keyPrice] : [],
      [keyOwner.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: isErc20 ? 0 : keyPrice,
      }
    )

  // get token ids
  const { events, blockNumber } = await tx.wait()
  const { args } = events.find((v) => v.event === 'Transfer')
  const { tokenId, from, to } = args

  return { tokenId, blockNumber, from, to, tx }
}

const purchaseKeys = async (lock, nbOfKeys = 1, isErc20 = false, signer) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    lock.address
  )

  // signer 0 is the lockOwner so keyOwners starts at index 1
  const signers = await ethers.getSigners()
  const keyOwners = signers.slice(1, nbOfKeys + 1)

  if (signer) {
    lock = lock.connect(signer)
  }

  const tx = await lock.purchase(
    isErc20 ? keyOwners.map(() => DEFAULT_KEY_PRICE) : [],
    keyOwners.map(({ address }) => address),
    keyOwners.map(() => ADDRESS_ZERO),
    keyOwners.map(() => ADDRESS_ZERO),
    keyOwners.map(() => []),
    {
      value: isErc20 ? 0 : DEFAULT_KEY_PRICE.mul(nbOfKeys),
    }
  )
  // get token ids
  const { events, blockNumber } = await tx.wait()
  const tokenIds = events
    .filter((v) => v.event === 'Transfer')
    .map(({ args }) => args.tokenId)

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
