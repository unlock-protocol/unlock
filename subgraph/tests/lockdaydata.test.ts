import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'

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
  now,
} from './constants'

import {
  createNewLockEvent,
  createLockManagerAddedEvent, // using RoleGranted
  createLockManagerRemovedEvent,
  createPricingChangedEvent,
  createLockUpgradedEvent,
  createLockMetadata,
} from './locks-utils'
import { handleNewLock, handleLockUpgraded } from '../src/unlock'
// mock contract functions
import './mocks'

describe('Describe LockDayData Events', () => {
  beforeAll(() => {
    const newLockEvent = createNewLockEvent(
      Address.fromString(lockOwner),
      Address.fromString(lockAddress)
    )
    handleNewLock(newLockEvent)
  })

  test('Creation of a lockDayData', () => {
    assert.entityCount('LockDayData', 1)
    assert.fieldEquals('LockDayData', '1', 'lockDeployed', '1')
    assert.fieldEquals('LockDayData', '1', 'keysSold', '0')
    assert.fieldEquals('LockDayData', '1', 'activeLocks', `[]`)
  })
})
