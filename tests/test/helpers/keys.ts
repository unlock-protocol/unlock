const { ethers, unlock } = require('hardhat')
const { AddressZero } = ethers.constants
import type { BigNumber } from 'ethers'

export const DEFAULT_KEY_PRICE = ethers.utils.parseEther('0.01')

export const genKeyId = (lockAddress: string, tokenId: BigNumber) =>
  `${lockAddress}-${tokenId.toString()}`

export const purchaseKey = async (
  lockAddress: string,
  keyOwnerAddress: string,
  price = null,
  isErc20 = false
) => {
  // make sure we got ethers lock
  const lock = await unlock.getLockContract(lockAddress)

  const purchasePrice = price || (await lock.keyPrice())

  const tx = await lock.purchase(
    [purchasePrice],
    [keyOwnerAddress],
    [AddressZero],
    [AddressZero],
    [[]],
    {
      value: isErc20 ? 0 : purchasePrice,
    }
  )
  // get token ids
  const { events, blockNumber, transactionHash } = await tx.wait()
  const { args } = events.find(
    (v: any) =>
      v.event === 'Transfer' &&
      v.address.toLowerCase() === lockAddress.toLowerCase()
  )
  const { tokenId, from, to } = args

  return { tokenId, blockNumber, from, to, transactionHash }
}

export const purchaseKeys = async (
  lockAddress: string,
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
    keyOwners.map((k: any) => k.address),
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
    .filter((v: any) => v.event === 'Transfer')
    .map(({ args }: any) => args.tokenId)

  return {
    tokenIds,
    keyOwners: keyOwners.map(({ address }: any) => address),
  }
}
