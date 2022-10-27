const { ethers, unlock } = require('hardhat')

const DEFAULT_KEY_PRICE = ethers.utils.parseEther('1')
const AddressZero = ethers.constants.AddressZero
const lockParams = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  currencyContractAddress: ethers.constants.AddressZero, // address 0 is ETH but could be any ERC20 token
  keyPrice: DEFAULT_KEY_PRICE, // in wei
  maxNumberOfKeys: 100,
  name: 'Unlock-Protocol Sample Lock',
}

// helpers
const purchaseKeys = async (
  lockAddress,
  nbOfKeys = 1,
  price = DEFAULT_KEY_PRICE,
  isErc20 = false
) => {
  // make sure we got ethers lock
  const lock = await unlock.getLockContract(lockAddress)

  // signer 0 is the lockOwner so keyOwners starts at index 1
  const signers = await ethers.getSigners()
  const keyOwners = signers.slice(1, nbOfKeys + 1)
  const tx = await lock.purchase(
    isErc20 ? keyOwners.map(() => price) : [],
    keyOwners.map((k) => k.address),
    keyOwners.map(() => AddressZero),
    keyOwners.map(() => AddressZero),
    keyOwners.map(() => []),
    {
      value: isErc20 ? 0 : price.mul(nbOfKeys),
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
  DEFAULT_KEY_PRICE,
  lockParams,
  purchaseKeys,
}
