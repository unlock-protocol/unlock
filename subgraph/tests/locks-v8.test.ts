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

import { createNewLockEvent, mockDataSourceV8 } from './locks-utils'
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
  lockAddressV8,
  keyGranters,
} from './constants'

// mock contract functions
import './mocks'

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
    assert.fieldEquals('Lock', lockAddressV8, 'version', '9')
    assert.fieldEquals('Lock', lockAddressV8, 'price', '1000')
    assert.fieldEquals('Lock', lockAddressV8, 'name', 'My lock v8')
    assert.fieldEquals(
      'Lock',
      lockAddressV8,
      'expirationDuration',
      `${duration}`
    )
    assert.fieldEquals('Lock', lockAddressV8, 'tokenAddress', nullAddress)
    assert.fieldEquals('Lock', lockAddressV8, 'lockManagers', `[]`)
    assert.fieldEquals('Lock', lockAddressV8, 'keyGranters', `[]`)

    assert.fieldEquals('Lock', lockAddressV8, 'totalKeys', '0')
    assert.fieldEquals('Lock', lockAddressV8, 'numberOfReceipts', '0')
    assert.fieldEquals(
      'Lock',
      lockAddressV8,
      'maxNumberOfKeys',
      `${maxNumberOfKeys}`
    )
    assert.fieldEquals('Lock', lockAddressV8, 'maxKeysPerAddress', '1')
  })

  describe('[Deprecation] Custom events replaced by OZ native role events in v8', () => {
    test('The `LockManagerAdded` event is not used', () => {
      mockDataSourceV8()
      assert.fieldEquals('Lock', lockAddressV8, 'lockManagers', `[]`)
      const newLockManagerAdded = createLockManagerAddedEvent(
        Address.fromString(lockManagers[0])
      )
      handleLockManagerAdded(newLockManagerAdded)

      assert.fieldEquals('Lock', lockAddressV8, 'lockManagers', `[]`)
    })

    test('The `KeyGranterAdded` event is not used', () => {
      mockDataSourceV8()
      assert.fieldEquals('Lock', lockAddressV8, 'keyGranters', `[]`)
      const newKeyGranterAdded = createKeyGranterAddedEvent(
        Address.fromString(keyGranters[0])
      )
      handleKeyGranterAdded(newKeyGranterAdded)

      assert.fieldEquals('Lock', lockAddressV8, 'keyGranters', `[]`)
    })
  })

  afterAll(() => {
    clearStore()
  })
})
