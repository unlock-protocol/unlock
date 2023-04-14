import { Address, BigInt } from '@graphprotocol/graph-ts'
import { PublicLockV11 } from '../generated/templates/PublicLock/PublicLockV11'
import { PublicLockV7 } from '../generated/templates/PublicLock/PublicLockV7'
import { UnlockDailyData, UnlockStats } from '../generated/schema'

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
  const response = lockContract.try_publicLockVersion()
  if (!response.reverted) {
    return BigInt.fromI32(response.value)
  }
  // Use v11 as default
  return BigInt.fromI32(11)
}

export function getKeyExpirationTimestampFor(
  lockAddress: Address,
  tokenId: BigInt,
  ownerAddress: Address
): BigInt {
  const version = getVersion(lockAddress)
  if (version.ge(BigInt.fromI32(10))) {
    const lockContract = PublicLockV11.bind(lockAddress)
    const response = lockContract.try_keyExpirationTimestampFor(tokenId)
    if (!response.reverted) {
      return response.value
    }
  } else {
    const lockContract = PublicLockV7.bind(lockAddress)
    const response = lockContract.try_keyExpirationTimestampFor(ownerAddress)
    if (!response.reverted) {
      return response.value
    }
  }
  return BigInt.fromI32(0)
}

export function loadOrCreateUnlockDailyData(
  timestamp: BigInt
): UnlockDailyData {
  const dayID = timestamp.toI32() / 86400
  let unlockDailyData = UnlockDailyData.load(dayID.toString())

  if (unlockDailyData === null) {
    unlockDailyData = new UnlockDailyData(dayID.toString())
    unlockDailyData.lockDeployed = BigInt.fromI32(0)
    unlockDailyData.keysSold = BigInt.fromI32(0)
    unlockDailyData.grossNetworkProduct = BigInt.fromI32(0)
    unlockDailyData.activeLocks = []

    const unlockStats = UnlockStats.load('0')
    if (unlockStats) {
      // This is always true because we create the UnlockStats when we start handling the createLock event!
      unlockDailyData.totalLockDeployed = unlockStats.totalLockDeployed
      unlockDailyData.totalKeysSold = unlockStats.totalKeysSold
    } else {
      unlockDailyData.totalLockDeployed = BigInt.fromI32(0)
      unlockDailyData.totalKeysSold = BigInt.fromI32(0)
    }

    unlockDailyData.save()
  }

  return unlockDailyData
}

export function getKeyManagerOf(
  lockAddress: Address,
  tokenId: BigInt,
  owner: Address
): Address {
  const lockContract = PublicLockV7.bind(lockAddress)
  const response = lockContract.try_keyManagerOf(tokenId)
  if (!response.reverted) {
    return response.value
  }
  return owner // fallback to owner when lockManager is null
}
