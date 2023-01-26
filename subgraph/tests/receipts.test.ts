import {
  afterAll,
  assert,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Lock } from '../generated/schema'

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
describe('Receipts for non-ERC20', () => {
  afterAll(() => {
    clearStore()
  })

  test('Receipt has been created', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
    const lock = new Lock(lockAddress)
    lock.address = Bytes.fromHexString(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(nullAddress)
    lock.price = BigInt.fromU32(keyPrice)
    lock.lockManagers = [Bytes.fromHexString(lockManagers[0])]
    lock.version = BigInt.fromU32(12)
    lock.totalKeys = BigInt.fromU32(0)
    lock.keys = []
    lock.deployer = Bytes.fromHexString(lockManagers[0])
    lock.save()

    // transfer event
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    newTransferEvent.transaction.value = lock.price
    handleTransfer(newTransferEvent)

    const hash = newTransferEvent.transaction.hash.toHexString()
    const timestamp = newTransferEvent.block.timestamp.toString()
    const msgSender = newTransferEvent.transaction.from.toHexString()
    const amount = newTransferEvent.transaction.value

    // key is there
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)

    // receipt is fine
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals('Receipt', hash, 'timestamp', timestamp)
    assert.fieldEquals('Receipt', hash, 'tokenAddress', nullAddress)
    assert.fieldEquals('Receipt', hash, 'sender', msgSender)
    assert.fieldEquals('Receipt', hash, 'payer', msgSender)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', amount.toString())

    dataSourceMock.resetValues()
  })

  test('Receipt created after key is extended', () => {
    mockDataSourceV11()

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

    dataSourceMock.resetValues()
  })

  test('should create receipt after key is renew', () => {
    mockDataSourceV8()
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
    const lockAddress = newRenewKeyPurchase.address.toHexString()
    const timestamp = newRenewKeyPurchase.block.timestamp

    const amount = newRenewKeyPurchase.transaction.value.toString()

    // receipts is fine
    assert.assertNotNull(newRenewKeyPurchase)
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals('Receipt', hash, 'timestamp', `${timestamp}`)
    assert.fieldEquals('Receipt', hash, 'sender', sender)
    assert.fieldEquals('Receipt', hash, 'payer', payer)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', amount)

    dataSourceMock.resetValues()
  })
})
