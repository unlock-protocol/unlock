import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { PublicLockV11 } from '../generated/templates/PublicLock/PublicLockV11'
import { PublicLockV7 } from '../generated/templates/PublicLock/PublicLockV7'

// keccak 256 of 'LOCK_MANAGER'
export const LOCK_MANAGER =
  'B89CDD26CDDD51301940BF2715F765B626B8A5A9E2681AC62DC83CC2DB2530C0'

// keccak 256 of 'KEY_GRANTER'
export const KEY_GRANTER =
  'B309C40027C81D382C3B58D8DE24207A34B27E1DB369B1434E4A11311F154B5E'

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
