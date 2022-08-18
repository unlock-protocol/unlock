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
import { createNewLockEvent } from './unlock-utils'

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
  beforeAll(() => {
    const lockOwner = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    )
    const newLockAddress = Address.fromString(
      '0x0000000000000000000000000000000000000002'
    )
    const newLockEvent = createNewLockEvent(lockOwner, newLockAddress)
    handleNewLock(newLockEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('Lock created and stored', () => {
    assert.entityCount('Lock', 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      'Lock',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
      'address',
      '0x0000000000000000000000000000000000000002'
    )
    assert.fieldEquals(
      'Lock',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
      'createdAtBlock',
      '1'
    )
    assert.fieldEquals(
      'Lock',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
      'version',
      '11'
    )
    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
