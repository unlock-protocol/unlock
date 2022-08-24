import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt, Value } from '@graphprotocol/graph-ts'
import {
  handleTransfer,
  handleCancelKey,
  handleExpireKey,
  handleExpirationChanged,
  handleKeyExtended,
  handleKeyManagerChanged,
  handleRenewKeyPurchase,
} from '../src/public-lock'
import {
  createTransferEvent,
  createCancelKeyEvent,
  createExpirationChangedEvent,
  createExpireKeyEvent,
  createKeyExtendedEvent,
  createKeyManagerChangedEvent,
  createRenewKeyPurchaseEvent,
  mockDataSourceV8,
  mockDataSourceV11,
  updateExpiration,
  updateExpirationV8,
} from './keys-utils'
import {
  keyOwnerAddress,
  now,
  nullAddress,
  tokenId,
  tokenURI,
  expiration,
  lockAddress,
  lockAddressV8,
} from './constants'

// mock contract functions
import './mocks'
import { Key } from '../generated/schema'

const keyID = `${lockAddress}-${tokenId}`
const keyIDV8 = `${lockAddressV8}-${tokenId}`

describe('Key transfers (v8)', () => {
  test('Creation of a new key (v8)', () => {
    mockDataSourceV8()
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyIDV8, 'lock', lockAddressV8)
    assert.fieldEquals('Key', keyIDV8, 'owner', keyOwnerAddress)
    assert.fieldEquals('Key', keyIDV8, 'tokenId', `${tokenId}`)
    assert.fieldEquals('Key', keyIDV8, 'tokenURI', `${tokenURI}`)
    assert.fieldEquals('Key', keyIDV8, 'expiration', `${expiration}`)
    assert.fieldEquals('Key', keyIDV8, 'createdAtBlock', '1')
  })

  afterAll(() => {
    clearStore()
    dataSourceMock.resetValues()
  })
})

describe('Key transfers', () => {
  beforeAll(() => {
    mockDataSourceV11()
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test('Creation of a new key', () => {
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'lock', lockAddress)
    assert.fieldEquals('Key', keyID, 'owner', keyOwnerAddress)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)
    assert.fieldEquals('Key', keyID, 'tokenURI', `${tokenURI}`)
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration}`)
    assert.fieldEquals('Key', keyID, 'createdAtBlock', '1')
  })

  test('Transfer of an existing key', () => {
    const newOwnerAddress = '0x0000000000000000000000000000000000000132'
    const newTransferEvent = createTransferEvent(
      Address.fromString(keyOwnerAddress),
      Address.fromString(newOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)
    assert.fieldEquals('Key', keyID, 'owner', newOwnerAddress)
  })
})

describe('Change in expiration timestamp', () => {
  test('should increase key timestamp', () => {
    mockDataSourceV11()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpiration(BigInt.fromU64(expiration + 1000))
    const newExpirationEvent = createExpirationChangedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU32(1000),
      true
    )

    handleExpirationChanged(newExpirationEvent)
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration + 1000}`)
    dataSourceMock.resetValues()
  })

  test('should increase key timestamp (v8)', () => {
    mockDataSourceV8()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpirationV8(BigInt.fromU64(expiration + 1000))
    const newExpirationEvent = createExpirationChangedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU32(1000),
      true
    )

    handleExpirationChanged(newExpirationEvent)
    assert.fieldEquals('Key', keyIDV8, 'expiration', `${expiration + 1000}`)
    dataSourceMock.resetValues()
  })
})

describe('Extend key', () => {
  test('should increase key timestamp', () => {
    mockDataSourceV11()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpiration(BigInt.fromU64(expiration + 5000))
    const newKeyExtended = createKeyExtendedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU64(expiration + 5000)
    )

    handleKeyExtended(newKeyExtended)
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration + 5000}`)
    dataSourceMock.resetValues()
  })
})

describe('Key is expired by lock manager', () => {
  test('should update the key expiration', () => {
    mockDataSourceV11()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpiration()
    const newExpireKeyEvent = createExpireKeyEvent(BigInt.fromU32(tokenId))

    handleExpireKey(newExpireKeyEvent)
    assert.fieldEquals('Key', keyID, 'expiration', `${now}`)
    dataSourceMock.resetValues()
  })

  test('should update the key expiration (v8)', () => {
    mockDataSourceV8()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpirationV8()
    const newExpireKeyEvent = createExpireKeyEvent(BigInt.fromU32(tokenId))

    handleExpireKey(newExpireKeyEvent)
    assert.fieldEquals('Key', keyIDV8, 'expiration', `${now}`)
    dataSourceMock.resetValues()
  })
})

describe('Key managers', () => {
  const newKeyManagerAddress = '0x0000000000000000000000000000000000000132'

  test('key manager changed', () => {
    mockDataSourceV11()

    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    const newKeyManagerChanged = createKeyManagerChangedEvent(
      BigInt.fromU32(tokenId),
      Address.fromString(newKeyManagerAddress)
    )

    handleKeyManagerChanged(newKeyManagerChanged)
    assert.fieldEquals('Key', keyID, 'manager', newKeyManagerAddress)
    dataSourceMock.resetValues()
  })

  test('key manager changed (v8)', () => {
    mockDataSourceV8()

    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    const newKeyManagerChanged = createKeyManagerChangedEvent(
      BigInt.fromU32(tokenId),
      Address.fromString(newKeyManagerAddress)
    )

    handleKeyManagerChanged(newKeyManagerChanged)
    assert.fieldEquals('Key', keyIDV8, 'manager', newKeyManagerAddress)
    dataSourceMock.resetValues()
  })
})

describe('Cancel keys', () => {
  test('cancel a key', () => {
    mockDataSourceV11()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    const newCancelKey = createCancelKeyEvent(BigInt.fromU32(tokenId))
    handleCancelKey(newCancelKey)
    assert.fieldEquals('Key', keyID, 'cancelled', 'true')

    dataSourceMock.resetValues()
  })
})

describe('RenewKeyPurchase (lock <v10)', () => {
  test('extend a key by the correct time (v8)', () => {
    mockDataSourceV8()

    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    updateExpirationV8()
    const newExpiration = expiration + 1000
    const newRenewKeyPurchase = createRenewKeyPurchaseEvent(
      Address.fromString(keyOwnerAddress),
      BigInt.fromU64(newExpiration)
    )
    handleRenewKeyPurchase(newRenewKeyPurchase)
    assert.fieldEquals('Key', keyIDV8, 'expiration', `${newExpiration}`)

    dataSourceMock.resetValues()
  })
})

describe('Change in expiration timestamp', () => {
  beforeAll(() => {
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    const newExpirationEvent = createExpirationChangedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU32(1000),
      true
    )
    handleExpirationChanged(newExpirationEvent)
  })

  test('increase timestamp', () => {
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration + 1000}`)
  })
})
