import { newMockEvent } from 'matchstick-as'
import {
  createMockedFunction,
  dataSourceMock,
} from 'matchstick-as/assembly/index'
import {
  ethereum,
  Address,
  BigInt,
  DataSourceContext,
  Value,
  dataSource,
  Bytes,
} from '@graphprotocol/graph-ts'
import {
  CancelKey,
  ExpirationChanged as ExpirationChangedUntilV11,
  ExpirationChanged1 as ExpirationChanged,
  ExpireKey,
  KeyExtended,
  KeyManagerChanged,
  LockManagerAdded,
  LockManagerRemoved,
  KeyGranterAdded,
  KeyGranterRemoved,
  Transfer,
  RenewKeyPurchase,
  RoleGranted,
} from '../generated/templates/PublicLock/PublicLock'
import { GNPChanged } from '../generated/Unlock/Unlock'

import {
  now,
  lockAddress,
  lockAddressV9,
  tokenId,
  keyOwnerAddress,
  lockOwner,
  nullAddress,
} from './constants'
import { newCancelKeyTransactionReceipt } from './mockTxReceipt'
import { KEY_GRANTER } from '../src/helpers'

export function mockDataSourceV9(): void {
  const V9context = new DataSourceContext()
  V9context.set(
    'lockAddress',
    Value.fromAddress(Address.fromString(lockAddressV9))
  )
  dataSourceMock.setReturnValues(lockAddressV9, 'rinkeby', V9context)
}

export function mockDataSourceV11(): void {
  const v11context = new DataSourceContext()
  v11context.set(
    'lockAddress',
    Value.fromAddress(Address.fromString(lockAddress))
  )
  dataSourceMock.setReturnValues(lockAddress, 'rinkeby', v11context)
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  const transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.address = dataSource.address()

  transferEvent.parameters = []

  transferEvent.parameters.push(
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createExpirationChangedEventUntilV11(
  _tokenId: BigInt,
  _amount: BigInt,
  _timeAdded: boolean
): ExpirationChangedUntilV11 {
  const expirationChangedEvent =
    changetype<ExpirationChangedUntilV11>(newMockEvent())

  expirationChangedEvent.address = dataSource.address()

  expirationChangedEvent.parameters = []

  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_tokenId',
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_amount',
      ethereum.Value.fromUnsignedBigInt(_amount)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_timeAdded',
      ethereum.Value.fromBoolean(_timeAdded)
    )
  )

  return expirationChangedEvent
}

export function createExpirationChangedEvent(
  tokenId: BigInt,
  amount: BigInt,
  expirationDuration: BigInt,
  timeAdded: boolean
): ExpirationChanged {
  const expirationChangedEvent = changetype<ExpirationChanged>(newMockEvent())

  expirationChangedEvent.address = dataSource.address()

  expirationChangedEvent.parameters = []

  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      'expirationDuration',
      ethereum.Value.fromUnsignedBigInt(expirationDuration)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam('timeAdded', ethereum.Value.fromBoolean(timeAdded))
  )

  return expirationChangedEvent
}

export function updateExpiration(exp: BigInt = BigInt.fromU64(now)): void {
  createMockedFunction(
    Address.fromString(lockAddress),
    'keyExpirationTimestampFor',
    'keyExpirationTimestampFor(uint256):(uint256)'
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
    .returns([ethereum.Value.fromUnsignedBigInt(exp)])
}

export function updateExpirationV9(exp: BigInt = BigInt.fromU64(now)): void {
  createMockedFunction(
    Address.fromString(lockAddressV9),
    'keyExpirationTimestampFor',
    'keyExpirationTimestampFor(address):(uint256)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(keyOwnerAddress))])
    .returns([ethereum.Value.fromUnsignedBigInt(exp)])
}

export function createKeyManagerChangedEvent(
  _tokenId: BigInt,
  _newManager: Address
): KeyManagerChanged {
  const keyManagerChangedEvent = changetype<KeyManagerChanged>(newMockEvent())

  keyManagerChangedEvent.address = dataSource.address()

  keyManagerChangedEvent.parameters = []

  keyManagerChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_tokenId',
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )
  keyManagerChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_newManager',
      ethereum.Value.fromAddress(_newManager)
    )
  )

  return keyManagerChangedEvent
}

export function createCancelKeyEvent(
  tokenAddress: Address,
  tokenId: BigInt,
  // owner: Address,
  // sendTo: Address,
  refund: BigInt
): CancelKey {
  const cancelKeyEvent = changetype<CancelKey>(newMockEvent())

  cancelKeyEvent.receipt = newCancelKeyTransactionReceipt(tokenAddress, refund)
  cancelKeyEvent.address = dataSource.address()

  cancelKeyEvent.parameters = []

  cancelKeyEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  // Does not really matter!
  cancelKeyEvent.parameters.push(
    new ethereum.EventParam(
      'owner',
      ethereum.Value.fromAddress(Address.fromString(lockOwner))
    )
  )
  // Does not really matter!
  cancelKeyEvent.parameters.push(
    new ethereum.EventParam(
      'sendTo',
      ethereum.Value.fromAddress(Address.fromString(lockOwner))
    )
  )
  cancelKeyEvent.parameters.push(
    new ethereum.EventParam('refund', ethereum.Value.fromUnsignedBigInt(refund))
  )

  return cancelKeyEvent
}

export function createExpireKeyEvent(tokenId: BigInt): ExpireKey {
  const expireKeyEvent = changetype<ExpireKey>(newMockEvent())

  expireKeyEvent.address = dataSource.address()

  expireKeyEvent.parameters = []

  expireKeyEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return expireKeyEvent
}

export function createKeyExtendedEvent(
  tokenId: BigInt,
  newTimestamp: BigInt
): KeyExtended {
  const keyExtendedEvent = changetype<KeyExtended>(newMockEvent())

  keyExtendedEvent.address = dataSource.address()
  keyExtendedEvent.parameters = []
  keyExtendedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  keyExtendedEvent.parameters.push(
    new ethereum.EventParam(
      'newTimestamp',
      ethereum.Value.fromUnsignedBigInt(newTimestamp)
    )
  )

  return keyExtendedEvent
}
// before v10
export function createRenewKeyPurchaseEvent(
  owner: Address,
  newTimestamp: BigInt
): RenewKeyPurchase {
  const renewKeyPurchaseEvent = changetype<RenewKeyPurchase>(newMockEvent())

  renewKeyPurchaseEvent.address = dataSource.address()

  renewKeyPurchaseEvent.parameters = []

  renewKeyPurchaseEvent.parameters.push(
    new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner))
  )
  renewKeyPurchaseEvent.parameters.push(
    new ethereum.EventParam(
      'newTimestamp',
      ethereum.Value.fromUnsignedBigInt(newTimestamp)
    )
  )

  return renewKeyPurchaseEvent
}

export function createLockManagerAddedEvent(
  account: Address
): LockManagerAdded {
  const lockManagerAddedEvent = changetype<LockManagerAdded>(newMockEvent())

  lockManagerAddedEvent.address = dataSource.address()
  lockManagerAddedEvent.parameters = []

  lockManagerAddedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return lockManagerAddedEvent
}

export function createKeyGranterAddedEvent(account: Address): KeyGranterAdded {
  const keyGranterAddedEvent = changetype<KeyGranterAdded>(newMockEvent())

  keyGranterAddedEvent.address = dataSource.address()
  keyGranterAddedEvent.parameters = []

  keyGranterAddedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return keyGranterAddedEvent
}

export function createKeyGranterRemovedEvent(
  account: Address
): KeyGranterRemoved {
  const keyGranterRemovedEvent = changetype<KeyGranterRemoved>(newMockEvent())

  // set existing lock address
  keyGranterRemovedEvent.address = Address.fromString(lockAddress)

  keyGranterRemovedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return keyGranterRemovedEvent
}

export function createRoleGrantedKeyGranterAddedEvent(
  newKeyGranter: Address
): RoleGranted {
  const newRoleGranted = changetype<RoleGranted>(newMockEvent())

  // set existing lock address
  newRoleGranted.address = Address.fromString(lockAddress)

  newRoleGranted.parameters = []
  newRoleGranted.parameters.push(
    new ethereum.EventParam(
      'role',
      ethereum.Value.fromBytes(Bytes.fromHexString(KEY_GRANTER))
    )
  )

  newRoleGranted.parameters.push(
    new ethereum.EventParam(
      'account',
      ethereum.Value.fromAddress(newKeyGranter)
    )
  )

  newRoleGranted.parameters.push(
    new ethereum.EventParam('sender', ethereum.Value.fromString(lockAddress))
  )

  return newRoleGranted
}
