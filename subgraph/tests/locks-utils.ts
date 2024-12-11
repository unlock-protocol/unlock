import { newMockEvent } from 'matchstick-as'
import { dataSourceMock } from 'matchstick-as/assembly/index'

import {
  ethereum,
  Address,
  BigInt,
  Value,
  Bytes,
  DataSourceContext,
} from '@graphprotocol/graph-ts'
import { NewLock, LockUpgraded } from '../generated/Unlock/Unlock'
import {
  RoleGranted,
  LockManagerRemoved,
  LockMetadata,
  RoleRevoked,
} from '../generated/templates/PublicLock/PublicLock'
import { lockAddress, lockAddressV9 } from './constants'
import { KEY_GRANTER, LOCK_MANAGER } from '../src/helpers'
import { PricingChanged } from '../generated/templates/PublicLock/PublicLock'

export function mockDataSourceV9(): void {
  const V9context = new DataSourceContext()
  V9context.set(
    'lockAddress',
    Value.fromAddress(Address.fromString(lockAddressV9))
  )
  dataSourceMock.setReturnValues(lockAddressV9, 'rinkeby', V9context)
}

export function createNewLockEvent(
  lockOwner: Address,
  newLockAddress: Address
): NewLock {
  const newLockEvent = changetype<NewLock>(newMockEvent())

  // Set a deterministic transaction hash for testing
  newLockEvent.transaction.hash = Bytes.fromHexString(
    '0x0000000000000000000000000000000000000000000000000000000000000001'
  )

  newLockEvent.parameters = []

  newLockEvent.parameters.push(
    new ethereum.EventParam('lockOwner', ethereum.Value.fromAddress(lockOwner))
  )
  newLockEvent.parameters.push(
    new ethereum.EventParam(
      'newLockAddress',
      ethereum.Value.fromAddress(newLockAddress)
    )
  )

  return newLockEvent
}

export function createRoleGrantedLockManagerAddedEvent(
  newLockManager: Address
): RoleGranted {
  const newRoleGranted = changetype<RoleGranted>(newMockEvent())

  // set existing lock address
  newRoleGranted.address = Address.fromString(lockAddress)

  newRoleGranted.parameters = []
  newRoleGranted.parameters.push(
    new ethereum.EventParam(
      'role',
      ethereum.Value.fromBytes(Bytes.fromHexString(LOCK_MANAGER))
    )
  )

  newRoleGranted.parameters.push(
    new ethereum.EventParam(
      'account',
      ethereum.Value.fromAddress(newLockManager)
    )
  )

  newRoleGranted.parameters.push(
    new ethereum.EventParam('sender', ethereum.Value.fromString(lockAddress))
  )

  return newRoleGranted
}

export function createLockManagerRemovedEvent(
  newLockManager: Address
): LockManagerRemoved {
  const newLockManagerRemoved = changetype<LockManagerRemoved>(newMockEvent())

  // set existing lock address
  newLockManagerRemoved.address = Address.fromString(lockAddress)

  newLockManagerRemoved.parameters = [
    new ethereum.EventParam(
      'account',
      ethereum.Value.fromAddress(newLockManager)
    ),
  ]

  return newLockManagerRemoved
}

export function createPricingChangedEvent(
  oldKeyPrice: BigInt,
  keyPrice: BigInt,
  oldTokenAddress: Address,
  tokenAddress: Address
): PricingChanged {
  const pricingChangedEvent = changetype<PricingChanged>(newMockEvent())

  // set existing lock address
  pricingChangedEvent.address = Address.fromString(lockAddress)

  pricingChangedEvent.parameters = []

  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'oldKeyPrice',
      ethereum.Value.fromUnsignedBigInt(oldKeyPrice)
    )
  )
  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'keyPrice',
      ethereum.Value.fromUnsignedBigInt(keyPrice)
    )
  )
  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'oldTokenAddress',
      ethereum.Value.fromAddress(oldTokenAddress)
    )
  )
  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenAddress',
      ethereum.Value.fromAddress(tokenAddress)
    )
  )

  return pricingChangedEvent
}

export function createLockUpgradedEvent(
  lockAddress: Address,
  version: BigInt
): LockUpgraded {
  const lockUpgradedEvent = changetype<LockUpgraded>(newMockEvent())

  // set existing lock address
  lockUpgradedEvent.parameters = []

  lockUpgradedEvent.parameters.push(
    new ethereum.EventParam(
      'lockAddress',
      ethereum.Value.fromAddress(lockAddress)
    )
  )
  lockUpgradedEvent.parameters.push(
    new ethereum.EventParam('version', ethereum.Value.fromI32(version.toI32()))
  )
  return lockUpgradedEvent
}

export function createLockMetadata(
  name: string,
  symbol: string,
  baseTokenURI: string
): LockMetadata {
  const LockMetadataEvent = changetype<LockMetadata>(newMockEvent())

  LockMetadataEvent.address = Address.fromString(lockAddress)

  // set existing lock address
  LockMetadataEvent.parameters = []

  LockMetadataEvent.parameters.push(
    new ethereum.EventParam('name', ethereum.Value.fromString(name))
  )
  LockMetadataEvent.parameters.push(
    new ethereum.EventParam('symbol', ethereum.Value.fromString(symbol))
  )
  LockMetadataEvent.parameters.push(
    new ethereum.EventParam(
      'baseTokenURI',
      ethereum.Value.fromString(baseTokenURI)
    )
  )

  return LockMetadataEvent
}

export function createRoleRevokedKeyGranterRemovedEvent(
  keyGranter: Address
): RoleRevoked {
  const newRoleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  // set existing lock address
  newRoleRevokedEvent.address = Address.fromString(lockAddress)

  newRoleRevokedEvent.parameters = []
  newRoleRevokedEvent.parameters.push(
    new ethereum.EventParam(
      'role',
      ethereum.Value.fromBytes(Bytes.fromHexString(KEY_GRANTER))
    )
  )

  newRoleRevokedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(keyGranter))
  )

  newRoleRevokedEvent.parameters.push(
    new ethereum.EventParam('sender', ethereum.Value.fromString(lockAddress))
  )

  return newRoleRevokedEvent
}

export function createRoleRevokedLockManagerRemovedEvent(
  lockManager: Address
): RoleRevoked {
  const newLockManagerRevoked = changetype<RoleRevoked>(newMockEvent())

  // set existing lock address
  newLockManagerRevoked.address = Address.fromString(lockAddress)

  newLockManagerRevoked.parameters = []
  newLockManagerRevoked.parameters.push(
    new ethereum.EventParam(
      'role',
      ethereum.Value.fromBytes(Bytes.fromHexString(LOCK_MANAGER))
    )
  )

  newLockManagerRevoked.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(lockManager))
  )

  newLockManagerRevoked.parameters.push(
    new ethereum.EventParam('sender', ethereum.Value.fromString(lockAddress))
  )

  return newLockManagerRevoked
}
