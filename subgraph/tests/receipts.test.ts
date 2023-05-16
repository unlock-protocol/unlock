import {
  beforeEach,
  assert,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { Lock, Key } from '../generated/schema'

import {
  keyOwnerAddress,
  nullAddress,
  tokenId,
  lockAddress,
  keyPrice,
  tokenAddress,
  lockManagers,
  expiration,
} from './constants'

import {
  createKeyExtendedEvent,
  createRenewKeyPurchaseEvent,
  createTransferEvent,
  mockDataSourceV11,
  mockDataSourceV8,
  updateExpiration,
} from './keys-utils'

import {
  handleKeyExtended,
  handleRenewKeyPurchase,
  handleTransfer,
} from '../src/public-lock'

// mock contract functions
import './mocks'

const keyID = `${lockAddress}-${tokenId}`

// Receipts for ERC20 locks are tested as part of integration tests
// because it is hard to trigger 2 Events and test things accurately
describe('Receipts for base currency locks', () => {
  beforeEach(() => {
    dataSourceMock.resetValues()
    clearStore()
  })

  test('Receipt has been created for transfers with value', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
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

    // transfer event
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    newTransferEvent.transaction.value = BigInt.fromU32(0) // This is a grantKeys transaction
    handleTransfer(newTransferEvent)

    // key is there
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)

    // receipt is not there
    assert.entityCount('Receipt', 0)
  })

  test('Receipt has not been created for transfers with no value', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
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

    // transfer event
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    newTransferEvent.transaction.value = BigInt.fromU32(0) // This is a grantKeys transaction
    handleTransfer(newTransferEvent)

    const hash = newTransferEvent.transaction.hash.toHexString()
    const timestamp = newTransferEvent.block.timestamp.toString()
    const msgSender = newTransferEvent.transaction.from.toHexString()
    const amount = newTransferEvent.transaction.value

    // key is there
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)

    // there is no receipt
    assert.entityCount('Receipt', 0)
  })

  test('should create receipt after key is renewed', () => {
    mockDataSourceV11()

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

    // renew event
    const newExpiration = expiration + 1000
    const newRenewKeyPurchase = createRenewKeyPurchaseEvent(
      Address.fromString(keyOwnerAddress),
      BigInt.fromU64(newExpiration)
    )

    // check that receipt is created after key is renew
    handleRenewKeyPurchase(newRenewKeyPurchase)

    const hash = newRenewKeyPurchase.transaction.hash.toHexString()
    const sender = newRenewKeyPurchase.transaction.from.toHexString()
    const payer = newRenewKeyPurchase.transaction.from.toHexString()
    const timestamp = newRenewKeyPurchase.block.timestamp

    const amount = newRenewKeyPurchase.transaction.value.toString()

    // receipts is fine
    assert.assertNotNull(newRenewKeyPurchase)
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'timestamp', `${timestamp}`)
    assert.fieldEquals('Receipt', hash, 'sender', sender)
    assert.fieldEquals('Receipt', hash, 'payer', payer)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', amount)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
  })

  test('Receipt created after key is extended', () => {
    mockDataSourceV11()

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

    const key = new Key(`${lockAddress}-${tokenId}`)
    key.lock = lockAddress
    key.tokenId = BigInt.fromU32(tokenId)
    key.owner = Address.fromString(keyOwnerAddress)
    key.expiration = BigInt.fromU32(1769984301) // does not really matter!
    key.createdAtBlock = BigInt.fromI32(1)
    key.createdAt = BigInt.fromU32(1769984301)
    key.save()

    // extend key event
    const newKeyExtended = createKeyExtendedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU64(expiration + 5000)
    )

    // check that receipt is created after key is extended
    handleKeyExtended(newKeyExtended)

    const hash = newKeyExtended.transaction.hash.toHexString()
    const sender = newKeyExtended.transaction.from.toHexString()
    const payer = newKeyExtended.transaction.from.toHexString()

    const amount = newKeyExtended.transaction.value

    // receipt is fine
    assert.assertNotNull(newKeyExtended)
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals(
      'Receipt',
      hash,
      'timestamp',
      `${newKeyExtended.block.timestamp}`
    )
    assert.fieldEquals('Receipt', hash, 'sender', sender)
    assert.fieldEquals('Receipt', hash, 'payer', payer)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', `${amount}`)
  })
})
