const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('../helpers/constants')

const DEFAULT_KEY_PRICE = ethers.utils.parseEther('0.01')

const purchaseKeys = async (_lock, nbOfKeys = 1) => {
  // make sure we got ethers lock
  const lock = await ethers.getContractAt('PublicLock', _lock.address)

  // signer 0 is the lockOwner so keyOwners starts at index 1
  const signers = await ethers.getSigners()
  const keyOwners = signers.slice(1, nbOfKeys + 1)

  const tx = await lock.purchase(
    [],
    keyOwners.map(({ address }) => address),
    keyOwners.map(() => ADDRESS_ZERO),
    keyOwners.map(() => ADDRESS_ZERO),
    keyOwners.map(() => []),
    {
      value: DEFAULT_KEY_PRICE.mul(nbOfKeys),
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
  purchaseKeys,
  DEFAULT_KEY_PRICE,
}
