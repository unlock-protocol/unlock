import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
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

describe('Describe UnlockDailyData Events', () => {
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

  test('Creation of a unlockDailyData', () => {
    const lockDayID = 1 / 86400
    assert.entityCount('UnlockDailyData', 1)
    assert.fieldEquals(
      'UnlockDailyData',
      lockDayID.toString(),
      'lockDeployed',
      '1'
    )
    assert.fieldEquals('UnlockDailyData', lockDayID.toString(), 'keysSold', '0')
    assert.fieldEquals(
      'UnlockDailyData',
      lockDayID.toString(),
      'activeLocks',
      `[]`
    )
  })
})
