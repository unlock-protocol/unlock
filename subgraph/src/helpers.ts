import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { PublicLockV11 } from '../generated/templates/PublicLock/PublicLockV11'
import { PublicLockV7 } from '../generated/templates/PublicLock/PublicLockV7'

export function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress.toHex().concat('-').concat(tokenId)
}

export function getVersion(lockAddress: Address): BigInt {
  const lockContract = PublicLockV11.bind(lockAddress)
  const version = lockContract.publicLockVersion()
  return BigInt.fromI32(version)
}

export function getKeyExpirationTimestampFor(
  lockAddress: Address,
  tokenId: BigInt,
  ownerAddress: Address
): BigInt {
  const version = getVersion(lockAddress)
  if (version.ge(BigInt.fromI32(10))) {
    const lockContract = PublicLockV11.bind(lockAddress)
    return lockContract.keyExpirationTimestampFor(tokenId)
  } else {
    const lockContract = PublicLockV7.bind(lockAddress)
    return lockContract.keyExpirationTimestampFor(ownerAddress)
  }
}
