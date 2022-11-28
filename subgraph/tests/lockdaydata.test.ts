import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index'
import { Address } from '@graphprotocol/graph-ts'
import { lockAddress, lockOwner } from './constants'
import { createNewLockEvent } from './locks-utils'
import { handleNewLock } from '../src/unlock'

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
    assert.fieldEquals('UnlockDailyData', lockDayID.toString(), 'grossNetworkProduct', '0')
  })
})
