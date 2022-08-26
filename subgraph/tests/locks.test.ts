import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index'
import { Address } from '@graphprotocol/graph-ts'

import { handleNewLock } from '../src/unlock'
import {
  handleLockManagerAdded,
  handleLockManagerRemoved,
} from '../src/public-lock'

import {
  createNewLockEvent,
  createLockManagerAddedEvent,
  createLockManagerRemovedEvent,
} from './locks-utils'
import { lockAddress, lockOwner } from './constants'

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
  })
})
