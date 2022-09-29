import { newMockEvent } from 'matchstick-as'
import {
  createMockedFunction,
  dataSourceMock,
} from 'matchstick-as/assembly/index'
import {
  ethereum,
  Address,
  BigInt,
  log,
  DataSourceContext,
  Value,
  dataSource,
} from '@graphprotocol/graph-ts'
import {
  CancelKey,
  ExpirationChanged,
  ExpireKey,
  KeyExtended,
  KeyManagerChanged,
  LockManagerAdded,
  LockManagerRemoved,
  Transfer,
  RenewKeyPurchase,
} from '../generated/templates/PublicLock/PublicLock'

import {
  now,
  lockAddress,
  lockAddressV8,
  tokenId,
  keyOwnerAddress,
} from './constants'

export function mockDataSourceV8(): void {
  const v8context = new DataSourceContext()
  v8context.set(
    'lockAddress',
    Value.fromAddress(Address.fromString(lockAddressV8))
  )
  dataSourceMock.setReturnValues(lockAddressV8, 'rinkeby', v8context)
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

export function createExpirationChangedEvent(
  _tokenId: BigInt,
  _amount: BigInt,
  _timeAdded: boolean
): ExpirationChanged {
  const expirationChangedEvent = changetype<ExpirationChanged>(newMockEvent())

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

export function updateExpiration(exp: BigInt = BigInt.fromU64(now)): void {
  createMockedFunction(
    Address.fromString(lockAddress),
    'keyExpirationTimestampFor',
    'keyExpirationTimestampFor(uint256):(uint256)'
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
    .returns([ethereum.Value.fromUnsignedBigInt(exp)])
}

export function updateExpirationV8(exp: BigInt = BigInt.fromU64(now)): void {
  createMockedFunction(
    Address.fromString(lockAddressV8),
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
  tokenId: BigInt
  // owner: Address,
  // sendTo: Address,
  // refund: bigint
): CancelKey {
  const cancelKeyEvent = changetype<CancelKey>(newMockEvent())

  cancelKeyEvent.address = dataSource.address()

  cancelKeyEvent.parameters = []

  cancelKeyEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  // cancelKeyEvent.parameters.push(
  //   new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner))
  // )
  // cancelKeyEvent.parameters.push(
  //   new ethereum.EventParam('sendTo', ethereum.Value.fromAddress(sendTo))
  // )
  // cancelKeyEvent.parameters.push(
  //   new ethereum.EventParam('refund', ethereum.Value.fromUnsignedBigInt(refund))
  // )

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

  lockManagerAddedEvent.parameters = []

  lockManagerAddedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return lockManagerAddedEvent
}

export function createLockManagerRemovedEvent(
  account: Address
): LockManagerRemoved {
  const lockManagerRemovedEvent = changetype<LockManagerRemoved>(newMockEvent())

  lockManagerRemovedEvent.parameters = []

  lockManagerRemovedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return lockManagerRemovedEvent
}
