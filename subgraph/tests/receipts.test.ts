import {
  beforeEach,
  assert,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
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
  defaultMockAddress,
} from './constants'

import {
  createCancelKeyEvent,
  createKeyExtendedEvent,
  createRenewKeyPurchaseEvent,
  createTransferEvent,
  mockDataSourceV11,
} from './keys-utils'

import {
  handleCancelKey,
  handleKeyExtended,
  handleRenewKeyPurchase,
  handleTransfer,
} from '../src/public-lock'

// mock functions
import './mocks'
import { newGNPChangedTransactionReceipt } from './mockTxReceipt'

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

    // transfer event
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    newTransferEvent.transaction.value = BigInt.fromU32(5) // This is a grantKeys transaction
    handleTransfer(newTransferEvent)

    // key is there
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)

    // receipt is not there
    assert.entityCount('Receipt', 1)
  })

  test('GNP value should override the tx value', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
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

    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )

    // append GNP event to tx
    const keyValue = BigInt.fromU32(200)
    const totalValue = BigInt.fromU32(1000) // specified a wrong tx.value

    // bind receipt and value to the tx
    newTransferEvent.transaction.value = totalValue
    newTransferEvent.receipt = newGNPChangedTransactionReceipt(
      keyValue,
      totalValue
    )

    handleTransfer(newTransferEvent)

    // receipt is there
    assert.entityCount('Receipt', 1)

    // make sure the GNPChanged event has been picked up correctly
    const hash = newTransferEvent.transaction.hash.toHexString()
    assert.fieldEquals(
      'Receipt',
      hash,
      'amountTransferred',
      keyValue.toString()
    )
  })

  test('Receipt has not been created for transfers with no value', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
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

describe('Receipts for an ERC20 locks', () => {
  beforeEach(() => {
    dataSourceMock.resetValues()
    clearStore()
  })

  test('Receipt has not been created for transfers without an ERC20 transfer', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
    const lock = new Lock(lockAddress)
    lock.address = Bytes.fromHexString(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(tokenAddress)
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

    // there is no receipt
    assert.entityCount('Receipt', 0)
  })
})

describe('Receipts for Cancel and refund', () => {
  beforeEach(() => {
    dataSourceMock.resetValues()
    clearStore()
  })

  test('Receipt created after cancel with refund, ERC20 Token', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
    const lock = new Lock(lockAddress)
    lock.address = Bytes.fromHexString(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(tokenAddress)
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

    const key = new Key(`${lockAddress}-${tokenId}`)
    key.lock = lockAddress
    key.tokenId = BigInt.fromU32(tokenId)
    key.owner = Address.fromString(keyOwnerAddress)
    key.expiration = BigInt.fromU32(1769984301) // does not really matter!
    key.createdAtBlock = BigInt.fromI32(1)
    key.createdAt = BigInt.fromU32(1769984301)
    key.save()

    // create mock cancel key event
    const newCancelKey = createCancelKeyEvent(
      Address.fromString(tokenAddress),
      BigInt.fromU32(tokenId),
      BigInt.fromU32(keyPrice)
    )
    handleCancelKey(newCancelKey)

    // receipt is there
    assert.entityCount('Receipt', 1)
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'lockAddress',
      lockAddress
    )
    assert.fieldEquals('Receipt', defaultMockAddress, 'payer', lockAddress)
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'sender',
      defaultMockAddress
    )
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'amountTransferred',
      keyPrice.toString()
    )
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'tokenAddress',
      tokenAddress
    )
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'recipient',
      keyOwnerAddress
    )
    assert.fieldEquals('Lock', lockAddress, 'numberOfReceipts', (0).toString())
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'numberOfCancelReceipts',
      (1).toString()
    )
  })

  test('Receipt has not been created for cancel without refund , ERC20 Token', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
    const lock = new Lock(lockAddress)
    lock.address = Bytes.fromHexString(lockAddress)
    lock.tokenAddress = Bytes.fromHexString(tokenAddress)
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

    const key = new Key(`${lockAddress}-${tokenId}`)
    key.lock = lockAddress
    key.tokenId = BigInt.fromU32(tokenId)
    key.owner = Address.fromString(keyOwnerAddress)
    key.expiration = BigInt.fromU32(1769984301) // does not really matter!
    key.createdAtBlock = BigInt.fromI32(1)
    key.createdAt = BigInt.fromU32(1769984301)
    key.save()

    // create mock cancel key event
    const newCancelKey = createCancelKeyEvent(
      Address.fromString(tokenAddress),
      BigInt.fromU32(tokenId),
      BigInt.fromU32(0)
    )
    handleCancelKey(newCancelKey)

    // receipt is there
    assert.entityCount('Receipt', 0)
  })

  test('Receipt created after cancel with refund, Base currency', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
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

    const key = new Key(`${lockAddress}-${tokenId}`)
    key.lock = lockAddress
    key.tokenId = BigInt.fromU32(tokenId)
    key.owner = Address.fromString(keyOwnerAddress)
    key.expiration = BigInt.fromU32(1769984301) // does not really matter!
    key.createdAtBlock = BigInt.fromI32(1)
    key.createdAt = BigInt.fromU32(1769984301)
    key.save()

    // create mock cancel key event
    const newCancelKey = createCancelKeyEvent(
      Address.fromString(nullAddress),
      BigInt.fromU32(tokenId),
      BigInt.fromU32(keyPrice)
    )
    handleCancelKey(newCancelKey)

    // receipt is there
    assert.entityCount('Receipt', 1)
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'lockAddress',
      lockAddress
    )
    assert.fieldEquals('Receipt', defaultMockAddress, 'payer', lockAddress)
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'sender',
      defaultMockAddress
    )
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'amountTransferred',
      BigInt.fromU32(keyPrice).toString()
    )
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'tokenAddress',
      nullAddress
    )
    assert.fieldEquals(
      'Receipt',
      defaultMockAddress,
      'recipient',
      keyOwnerAddress
    )
    assert.fieldEquals('Lock', lockAddress, 'numberOfReceipts', (0).toString())
    assert.fieldEquals(
      'Lock',
      lockAddress,
      'numberOfCancelReceipts',
      (1).toString()
    )
  })

  test('Receipt has not been created for cancel without refund, Base currency', () => {
    mockDataSourceV11()

    // create fake ETH lock in subgraph
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

    const key = new Key(`${lockAddress}-${tokenId}`)
    key.lock = lockAddress
    key.tokenId = BigInt.fromU32(tokenId)
    key.owner = Address.fromString(keyOwnerAddress)
    key.expiration = BigInt.fromU32(1769984301) // does not really matter!
    key.createdAtBlock = BigInt.fromI32(1)
    key.createdAt = BigInt.fromU32(1769984301)
    key.save()

    // create mock cancel key event
    const newCancelKey = createCancelKeyEvent(
      Address.fromString(tokenAddress),
      BigInt.fromU32(tokenId),
      BigInt.fromU32(0)
    )
    handleCancelKey(newCancelKey)

    // receipt is not there
    assert.entityCount('Receipt', 0)
  })
})
