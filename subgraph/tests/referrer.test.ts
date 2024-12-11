import { assert, describe, test, beforeAll } from 'matchstick-as/assembly/index'
import { createReferrerEvent } from './referrer-utils'
import {
  defaultMockAddress,
  keyPrice,
  lockAddress,
  lockManagers,
  nullAddress,
  referrerFee,
} from './constants'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { handleReferrerFees } from '../src/public-lock'
import { Lock } from '../generated/schema'

describe('Referrer', () => {
  // Before every test create a brand new lock
  beforeAll(() => {
    const lock = new Lock(lockAddress)
    lock.address = Bytes.fromHexString(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(nullAddress)
    lock.price = BigInt.fromU32(keyPrice)
    lock.lockManagers = [Bytes.fromHexString(lockManagers[0])]
    lock.keyGranters = [Bytes.fromHexString(lockManagers[0])]
    lock.version = BigInt.fromU32(12)
    lock.totalKeys = BigInt.fromU32(0)
    lock.deployer = Bytes.fromHexString(lockManagers[0])
    lock.numberOfReceipts = BigInt.fromU32(0)
    lock.numberOfCancelReceipts = BigInt.fromU32(0)
    lock.creationTransactionHash =
      '0x0000000000000000000000000000000000000000000000000000000000000001'
    lock.createdAtBlock = BigInt.fromI32(1)
    lock.save()
  })

  // Creation of a new referrer
  test('Creation of a new referrer', () => {
    // Make sure a "Lock" has been created
    assert.entityCount('Lock', 1)

    // Create an referrer event with "referrer" address and "fee" number
    const newReferrerEvent = createReferrerEvent(
      Address.fromString(defaultMockAddress),
      BigInt.fromU32(referrerFee)
    )

    // Assign the referrer transfer with the same lock address that has been created ✅
    newReferrerEvent.address = Address.fromString(lockAddress)

    // Handle the referrer fee as if it was in the subgraph
    handleReferrerFees(newReferrerEvent)

    // Referrer address as "id"
    const referrerAddress = newReferrerEvent.params.referrer.toHexString()

    // Make sure referrer fee has been created ✅
    assert.entityCount('ReferrerFee', 1)

    // Check if lock address is the same as the lock address you created
    assert.fieldEquals('ReferrerFee', referrerAddress, 'lock', lockAddress)

    // Make sure the referrer fee is "200" where we assigned it in `createReferrerEvent` function
    assert.fieldEquals('ReferrerFee', referrerAddress, 'fee', '200')

    // Make sure the referrer address is the same address where you have assigned it in `createReferrerEvent` function
    assert.fieldEquals(
      'ReferrerFee',
      referrerAddress,
      'referrer',
      defaultMockAddress
    )
  })

  test('Changing referrer fee', () => {
    // Create an referrer event with "referrer" address and "fee" number
    const newReferrerEvent = createReferrerEvent(
      Address.fromString(defaultMockAddress),
      BigInt.fromU32(100)
    )

    // Assign the referrer transfer event with the same lock address ✅
    newReferrerEvent.address = Address.fromString(lockAddress)

    // Handle the referrer fee as if it was in the subgraph
    handleReferrerFees(newReferrerEvent)

    // Check if lock address is same
    assert.fieldEquals('ReferrerFee', defaultMockAddress, 'lock', lockAddress)

    // Make sure the referrer fee is "100" since it changed
    assert.fieldEquals('ReferrerFee', defaultMockAddress, 'fee', '100')

    // Make sure the referrer address is the same even if you've changed the referrer fee
    assert.fieldEquals(
      'ReferrerFee',
      defaultMockAddress,
      'referrer',
      defaultMockAddress
    )
  })
})
