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
  handleKeyGranterAdded,
} from '../src/public-lock'

import { createNewLockEvent, mockDataSourceV9 } from './locks-utils'
import {
  createKeyGranterAddedEvent,
  createLockManagerAddedEvent,
} from './keys-utils'

import {
  duration,
  lockManagers,
  lockOwner,
  nullAddress,
  maxNumberOfKeys,
  lockAddressV9,
  keyGranters,
} from './constants'

// mock contract functions
import './mocks'

describe('Describe Locks events (v9)', () => {
  beforeAll(() => {
    mockDataSourceV9()
    const newLockEvent = createNewLockEvent(
      Address.fromString(lockOwner),
      Address.fromString(lockAddressV9)
    )
    handleNewLock(newLockEvent)
  })
  test('Creation of a new lock (v9)', () => {
    assert.entityCount('Lock', 1)
    assert.fieldEquals('Lock', lockAddressV9, 'address', lockAddressV9)
    assert.fieldEquals('Lock', lockAddressV9, 'createdAtBlock', '1')
    assert.fieldEquals('Lock', lockAddressV9, 'version', '9')
    assert.fieldEquals('Lock', lockAddressV9, 'price', '1000')
    assert.fieldEquals('Lock', lockAddressV9, 'name', 'My lock v9')
    assert.fieldEquals(
      'Lock',
      lockAddressV9,
      'expirationDuration',
      `${duration}`
    )
    assert.fieldEquals('Lock', lockAddressV9, 'tokenAddress', nullAddress)
    assert.fieldEquals('Lock', lockAddressV9, 'lockManagers', `[]`)
    assert.fieldEquals('Lock', lockAddressV9, 'keyGranters', `[]`)

    assert.fieldEquals('Lock', lockAddressV9, 'totalKeys', '0')
    assert.fieldEquals('Lock', lockAddressV9, 'numberOfReceipts', '0')
    assert.fieldEquals(
      'Lock',
      lockAddressV9,
      'maxNumberOfKeys',
      `${maxNumberOfKeys}`
    )
    assert.fieldEquals('Lock', lockAddressV9, 'maxKeysPerAddress', '1')
  })

  describe('[Deprecation] Custom events replaced by OZ native role events in v9', () => {
    test('The `LockManagerAdded` event is not used', () => {
      mockDataSourceV9()
      assert.fieldEquals('Lock', lockAddressV9, 'lockManagers', `[]`)
      const newLockManagerAdded = createLockManagerAddedEvent(
        Address.fromString(lockManagers[0])
      )
      handleLockManagerAdded(newLockManagerAdded)

      assert.fieldEquals('Lock', lockAddressV9, 'lockManagers', `[]`)
    })

    test('The `KeyGranterAdded` event is not used', () => {
      mockDataSourceV9()
      assert.fieldEquals('Lock', lockAddressV9, 'keyGranters', `[]`)
      const newKeyGranterAdded = createKeyGranterAddedEvent(
        Address.fromString(keyGranters[0])
      )
      handleKeyGranterAdded(newKeyGranterAdded)

      assert.fieldEquals('Lock', lockAddressV9, 'keyGranters', `[]`)
    })
  })

  afterAll(() => {
    clearStore()
  })
})
