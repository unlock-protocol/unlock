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
  handleLockManagerAdded,
  handleLockManagerRemoved,
  handlePricingChanged,
} from '../src/public-lock'

import {
  createNewLockEvent,
  createLockManagerAddedEvent,
  createLockManagerRemovedEvent,
  createPricingChangedEvent,
  createLockUpgradedEvent,
} from './locks-utils'
import {
  keyPrice,
  newKeyPrice,
  lockAddress,
  lockOwner,
  tokenAddress,
  nullAddress,
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
    assert.fieldEquals('Lock', lockAddress, 'tokenAddress', nullAddress)
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[${lockOwner}]`)
  })

  test('Lock manager added', () => {
    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[${lockOwner}]`)
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

  test('Lock manager removed', () => {
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'lockManagers',
      `[${lockOwner}, ${lockManager}]`
    )
    const newLockManagerAdded = createLockManagerAddedEvent(
      Address.fromString(lockManager)
    )
    handleLockManagerAdded(newLockManagerAdded)

    const newLockManagerRemoved = createLockManagerRemovedEvent(
      Address.fromString(lockManager)
    )
    handleLockManagerRemoved(newLockManagerRemoved)

    assert.fieldEquals('Lock', lockAddress, 'lockManagers', `[${lockOwner}]`)
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
})
