import {
  assert,
  describe,
  test,
  clearStore,
  afterAll,
  beforeAll,
} from 'matchstick-as/assembly/index'
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
    lock.version = BigInt.fromU32(12)
    lock.totalKeys = BigInt.fromU32(0)
    lock.deployer = Bytes.fromHexString(lockManagers[0])
    lock.numberOfReceipts = BigInt.fromU32(0)
    lock.save()
  })

  // After each test clear the store
  afterAll(() => {
    clearStore()
  })

  // Creation of a new referrer
  test('Creation of a new referrer', () => {
    // Make sure a "Lock" has been created
    assert.entityCount('Lock', 1)

    // Create an referrer event with "referrer" address and "fee" number
    const newTransferEvent = createReferrerEvent(
      Address.fromString(defaultMockAddress),
      BigInt.fromU32(referrerFee)
    )

    // Assign the referrer transfer with the same lock address that has been created ✅
    newTransferEvent.address = Address.fromString(lockAddress)

    // Handle the referrer fee as if it was in the subgraph
    handleReferrerFees(newTransferEvent)

    // Transaction hash is used as "id"
    const referrerTransactionHash =
      newTransferEvent.transaction.hash.toHexString()

    // Make sure referrer fee has been created ✅
    assert.entityCount('ReferrerFee', 1)

    // Check if lock address is the same as the lock address you created
    assert.fieldEquals(
      'ReferrerFee',
      referrerTransactionHash,
      'lock',
      lockAddress
    )

    // Make sure the referrer fee is "200" where we assigned it in `createReferrerEvent` function
    assert.fieldEquals('ReferrerFee', referrerTransactionHash, 'fee', '200')

    // Make sure the referrer address is the same address where you have assigned it in `createReferrerEvent` function
    assert.fieldEquals(
      'ReferrerFee',
      referrerTransactionHash,
      'referrer',
      defaultMockAddress
    )
  })
})
