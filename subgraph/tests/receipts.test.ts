import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
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
} from './constants'

import {
  createTransferEvent,
  mockDataSourceV11,
} from './keys-utils'

import {
  handleTransfer,
} from '../src/public-lock'

// mock contract functions
import './mocks'

const keyID = `${lockAddress}-${tokenId}`

describe('Receipts for new key (in ETH)', () => {

  afterAll(() => {
    clearStore()
  })

  test('Receipt has been created', () => {

    mockDataSourceV11()

    // create fake ETH lock in subgraph
    let lock = new Lock(lockAddress)
    lock.address = Bytes.fromHexString(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(nullAddress)
    lock.price = BigInt.fromU32(keyPrice)
    lock.lockManagers = [Bytes.fromHexString(lockManagers[0])]
    lock.version = BigInt.fromU32(12)
    lock.totalKeys = BigInt.fromU32(0)
    lock.keys = []
    lock.deployer = Bytes.fromHexString(lockManagers[0])
    lock.save()

    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    const hash = newTransferEvent.transaction.hash.toHexString()
    const timestamp = newTransferEvent.block.timestamp.toString()
    const msgSender = newTransferEvent.transaction.from.toHexString()

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
    assert.fieldEquals('Receipt', hash, 'amountTransferred', keyPrice.toString())
  })
})

/*
describe('Receipts for new key (in ERC20)', () => {
  let hash: string, timestamp:string , msgSender: string
  beforeAll(() => {
    mockDataSourceV11();
    
    // create fake ERC20 lock in subgraph
    let lock = new Lock(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(tokenAddress)
    lock.save()

    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)
    hash = newTransferEvent.transaction.hash.toHexString()
    timestamp = newTransferEvent.block.timestamp.toString()
    msgSender = newTransferEvent.transaction.from.toHexString()
  })

  afterAll(() => {
    clearStore()
  })

  test('Key has been created', () => {
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)
  })

  test('Receipt has been created', () => {
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals('Receipt', hash, 'timestamp', timestamp)
    assert.fieldEquals('Receipt', hash, 'tokenAddress', tokenAddress)
    assert.fieldEquals('Receipt', hash, 'sender', msgSender)
    assert.fieldEquals('Receipt', hash, 'payer', msgSender)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', keyPrice.toString())
  })
})

describe('Receipts for key extended', () => {
  test('should create receipt after key is extended on ERC20 lock', () => {
    mockDataSourceV11()

    // mock and test
    updateExpiration(BigInt.fromU64(expiration + 5000))

    const newKeyExtended = createKeyExtendedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU64(expiration + 5000),
      true 
    )

    // check that receipt is created after key is extended
    handleKeyExtended(newKeyExtended)

    const hash = newKeyExtended.transaction.hash.toHexString()
    const sender = newKeyExtended.transaction.from.toHexString()
    const payer = newKeyExtended.transaction.from.toHexString()
    const amount = newKeyExtended.transaction.value

    // test values for not ERC20
    assert.assertNotNull(newKeyExtended)
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals(
      'Receipt',
      hash,
      'timestamp',
      `${newTransferEvent.block.timestamp}`
    )
    assert.fieldEquals('Receipt', hash, 'sender', sender)
    assert.fieldEquals('Receipt', hash, 'payer', payer)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', `${amount}`)

    dataSourceMock.resetValues()
  })

  test('should create receipt after key is extended', () => {
    mockDataSourceV11()

    // mock and test
    updateExpiration(BigInt.fromU64(expiration + 5000))

    const newKeyExtended = createKeyExtendedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU64(expiration + 5000),
      false
    )

    // check that receipt is created after key is extended
    handleKeyExtended(newKeyExtended)

    const hash = newTransferEvent.transaction.hash.toHexString()
    const sender = newTransferEvent.transaction.from.toHexString()
    const payer = newTransferEvent.transaction.from.toHexString()

    const amount = newTransferEvent.transaction.value

    // test values for not ERC20
    assert.assertNotNull(newKeyExtended)
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals(
      'Receipt',
      hash,
      'timestamp',
      `${newTransferEvent.block.timestamp}`
    )
    assert.fieldEquals('Receipt', hash, 'sender', sender)
    assert.fieldEquals('Receipt', hash, 'payer', payer)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', `${amount}`)

    dataSourceMock.resetValues()
  })
})

describe('Receipt for key renewal', () => {
  test('should create receipt after key is renew', () => {
    mockDataSourceV8()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

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
    const lockAddress = newTransferEvent.address.toHexString()

    const amount = newRenewKeyPurchase.transaction.value.toString()

    // test values for not ERC20
    assert.assertNotNull(newRenewKeyPurchase)
    assert.entityCount('Receipt', 1)
    assert.fieldEquals('Receipt', hash, 'id', hash)
    assert.fieldEquals('Receipt', hash, 'lockAddress', lockAddress)
    assert.fieldEquals(
      'Receipt',
      hash,
      'timestamp',
      `${newRenewKeyPurchase.block.timestamp}`
    )
    assert.fieldEquals('Receipt', hash, 'sender', sender)
    assert.fieldEquals('Receipt', hash, 'payer', payer)
    assert.fieldEquals('Receipt', hash, 'amountTransferred', amount)

    dataSourceMock.resetValues()
  })
})
*/