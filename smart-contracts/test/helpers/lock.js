const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers/constants')

const DEFAULT_KEY_PRICE = ethers.utils.parseEther('0.01')

const purchaseKey = async (lock, keyOwner, isErc20 = false) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    lock.address
  )

  const tx = await lock
    .connect(keyOwner)
    .purchase(
      isErc20 ? [DEFAULT_KEY_PRICE] : [],
      [keyOwner.address],
      [ADDRESS_ZERO],
      [ADDRESS_ZERO],
      [[]],
      {
        value: isErc20 ? 0 : DEFAULT_KEY_PRICE,
      }
    )

  // get token ids
  const { events, blockNumber } = await tx.wait()
  const { args } = events.find((v) => v.event === 'Transfer')
  const { tokenId, from, to } = args

  return { tokenId, blockNumber, from, to }
}

const purchaseKeys = async (lock, nbOfKeys = 1, isErc20 = false) => {
  // make sure we got ethers lock
  lock = await ethers.getContractAt(
    'contracts/PublicLock.sol:PublicLock',
    lock.address
  )

  // signer 0 is the lockOwner so keyOwners starts at index 1
  const signers = await ethers.getSigners()
  const keyOwners = signers.slice(1, nbOfKeys + 1)

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
  const { events } = await tx.wait()
  const tokenIds = events
    .filter((v) => v.event === 'Transfer')
    .map(({ args }) => args.tokenId)

  return {
    tokenIds,
    keyOwners: keyOwners.map(({ address }) => address),
  }
}

module.exports = {
  purchaseKey,
  purchaseKeys,
  DEFAULT_KEY_PRICE,
}
