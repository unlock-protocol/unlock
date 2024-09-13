const { ethers, unlock } = require('hardhat')
const { ZeroAddress } = ethers

export const DEFAULT_KEY_PRICE = ethers.parseEther('0.01')

export const genKeyId = (lockAddress: string, tokenId: bigint) =>
  `${lockAddress}-${tokenId.toString()}`

export const purchaseKey = async (
  lockAddress: string,
  keyOwnerAddress: string,
  price = null
) => {
  // make sure we got ethers lock
  const lock = await unlock.getLockContract(lockAddress)
  const isErc20 = (await lock.tokenAddress()) !== ZeroAddress

  const purchasePrice = price || (await lock.keyPrice())

  const tx = await lock.purchase(
    isErc20 ? [purchasePrice] : [],
    [keyOwnerAddress],
    [ZeroAddress],
    [ZeroAddress],
    ['0x'],
    {
      value: isErc20 ? 0 : purchasePrice,
    }
  )
  // get token ids
  const { logs, blockNumber, hash } = await tx.wait()
  const { args } = logs.find(
    ({ fragment }: any) => fragment && fragment.name === 'Transfer'
  )

  const { tokenId, from, to } = args

  return { tokenId, blockNumber, from, to, transactionHash: hash }
}

export const purchaseKeys = async (
  lockAddress: string,
  nbOfKeys = 1,
  price = DEFAULT_KEY_PRICE
) => {
  // make sure we got ethers lock
  const lock = await unlock.getLockContract(lockAddress)
  const isErc20 = (await lock.tokenAddress()) !== ZeroAddress

  // signer 0 is the lockOwner so keyOwners starts at index 1
  const signers = await ethers.getSigners()
  const keyOwners = signers.slice(1, nbOfKeys + 1)

  const tx = await lock.purchase(
    isErc20 ? keyOwners.map(() => price) : [],
    keyOwners.map(({ address }: { address: string }) => address),
    keyOwners.map(() => ZeroAddress),
    keyOwners.map(() => ZeroAddress),
    keyOwners.map(() => '0x'),
    {
      value: isErc20 ? 0 : price * BigInt(nbOfKeys),
    }
  )
  // get token ids
  const { logs } = await tx.wait()
  const tokenIds = logs
    .filter(({ fragment }: any) => fragment && fragment.name === 'Transfer')
    .map(({ args }: any) => args.tokenId)

  return {
    tokenIds,
    keyOwners: keyOwners.map(({ address }: any) => address),
  }
}
