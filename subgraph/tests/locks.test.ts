import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'

import { handleNewLock, handleLockUpgraded } from '../src/unlock'
import {
  handleRoleGranted,
  handleLockManagerAdded,
  handleLockManagerRemoved,
  handlePricingChanged,
  handleLockMetadata,
} from '../src/public-lock'

import {
  createNewLockEvent,
  createRoleGrantedLockManagerAddedEvent, // using RoleGranted
  createLockManagerAddedEvent, 
  createLockManagerRemovedEvent,
  createPricingChangedEvent,
  createLockUpgradedEvent,
  createLockMetadata,
  mockDataSourceV8,
} from './locks-utils'
import {
  duration,
  keyPrice,
  newKeyPrice,
  lockAddress,
  lockOwner,
  tokenAddress,
  nullAddress,
  name,
  symbol,
  baseTokenURI,
  maxNumberOfKeys,
  maxKeysPerAddress,
  lockAddressV8,
} from './constants'

// mock contract functions
import './mocks'

const lockManager = '0x0000000000000000000000000000000000000123'

describe('Describe Locks events', () => {
  beforeAll(() => {
    const newLockEvent = createNewLockEvent(
      Address.fromString(lockOwner),
      Address.fromString(lockAddress)
    )
    handleNewLock(newLockEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test('Lock created and stored', () => {
    assert.entityCount('Lock', 1)
    assert.fieldEquals('Lock', lockAddress, 'address', lockAddress)
    assert.fieldEquals('Lock', lockAddress, 'createdAtBlock', '1')
    assert.fieldEquals('Lock', lockAddress, 'version', '11')
    assert.fieldEquals('Lock', lockAddress, 'price', '1000')
    assert.fieldEquals('Lock', lockAddress, 'name', 'My lock graph')
    assert.fieldEquals('Lock', lockAddress, 'expirationDuration', `${duration}`)
    assert.fieldEquals('Lock', lockAddress, 'tokenAddress', nullAddress)
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[]`)
    assert.fieldEquals('Lock', lockAddress, 'totalKeys', '0')
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'maxNumberOfKeys',
      `${maxNumberOfKeys}`
    )
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'maxKeysPerAddress',
      `${maxKeysPerAddress}`
    )
  })

  test('Lock manager added (using `RoleGranted`)', () => {
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[]`)
    const newLockManagerAdded = createRoleGrantedLockManagerAddedEvent(
      Address.fromString(lockManager)
    )
    handleRoleGranted(newLockManagerAdded)
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[${lockManager}]`)
  })

  test('Lock manager added (using `LockManagerAdded`)', () => {
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[${lockManager}]`)
    const newLockManagerAdded = createLockManagerAddedEvent(
      Address.fromString(lockManager)
    )
    handleLockManagerAdded(newLockManagerAdded)
    // event should be ignored in v11 as we use `RoleGranted` instead
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'lockManagers',
      `[${lockManager}, ${lockManager}]`
    )
  })

  test('Lock manager removed', () => {
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[${lockManager}]`)

    const newLockManagerRemoved = createLockManagerRemovedEvent(
      Address.fromString(lockManager)
    )
    handleLockManagerRemoved(newLockManagerRemoved)

    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[]`)
  })

  test('Price changed', () => {
    assert.fieldEquals('Lock', lockAddress, 'price', `${keyPrice}`)
    assert.fieldEquals('Lock', lockAddress, 'tokenAddress', nullAddress)

    const newPricingChanged = createPricingChangedEvent(
      BigInt.fromU32(keyPrice),
      BigInt.fromU32(newKeyPrice),
      Address.fromString(nullAddress),
      Address.fromString(tokenAddress)
    )
    handlePricingChanged(newPricingChanged)

    assert.fieldEquals('Lock', lockAddress, 'tokenAddress', tokenAddress)
    assert.fieldEquals('Lock', lockAddress, 'price', `${newKeyPrice}`)
  })

  test('Lock upgraded', () => {
    const version = BigInt.fromU32(12)
    const newLockUpgraded = createLockUpgradedEvent(
      Address.fromString(lockAddress),
      version
    )
    handleLockUpgraded(newLockUpgraded)

    assert.fieldEquals('Lock', lockAddress, 'version', `12`)
  })

  test('Lock metadata', () => {
    assert.fieldEquals('Lock', lockAddress, 'name', 'My lock graph')
    const newLockMetadata = createLockMetadata(name, symbol, baseTokenURI)
    handleLockMetadata(newLockMetadata)

    assert.fieldEquals('Lock', lockAddress, 'name', name)
    assert.fieldEquals('Lock', lockAddress, 'symbol', symbol)
    // assert.fieldEquals('Lock', lockAddress, 'baseTokenURI', `12`)
  })
})

describe('Describe Locks events (v8)', () => {
  beforeAll(() => {
    mockDataSourceV8()
    const newLockEvent = createNewLockEvent(
      Address.fromString(lockOwner),
      Address.fromString(lockAddressV8)
    )
    handleNewLock(newLockEvent)
  })
  test('Creation of a new lock (v8)', () => {
    assert.entityCount('Lock', 1)
    assert.fieldEquals('Lock', lockAddressV8, 'address', lockAddressV8)
    assert.fieldEquals('Lock', lockAddressV8, 'createdAtBlock', '1')
    assert.fieldEquals('Lock', lockAddressV8, 'version', '8')
    assert.fieldEquals('Lock', lockAddressV8, 'price', '1000')
    assert.fieldEquals('Lock', lockAddressV8, 'name', 'My lock v8')
    assert.fieldEquals('Lock', lockAddressV8, 'expirationDuration', `${duration}`)
    assert.fieldEquals('Lock', lockAddressV8, 'tokenAddress', nullAddress)
    assert.fieldEquals('Lock', lockAddressV8, 'lockManagers', `[${lockOwner}]`)
    assert.fieldEquals('Lock', lockAddressV8, 'totalKeys', '0')
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'maxNumberOfKeys',
      `${maxNumberOfKeys}`
    )
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'maxKeysPerAddress',
      `${maxKeysPerAddress}`
    )
  })

  test('Lock manager added (v8)', () => {
    assert.fieldEquals('Lock', lockAddressV8, 'lockManagers', `[${lockOwner}]`)
    const newLockManagerAdded = createLockManagerAddedEvent(
      Address.fromString(lockManager)
    )
    handleLockManagerAdded(newLockManagerAdded)

    assert.fieldEquals(
      'Lock',
      lockAddress,
      'lockManagers',
      `[${lockOwner}, ${lockManager}]`
    )
  })

  afterAll(() => {
    clearStore()
  })
})