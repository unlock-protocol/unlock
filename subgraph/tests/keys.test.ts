import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  handleTransfer,
  handleCancelKey,
  handleExpireKey,
  handleExpirationChanged,
  handleExpirationChangedUntilV11,
  handleKeyExtended,
  handleKeyManagerChanged,
  handleRenewKeyPurchase,
} from '../src/public-lock'
import {
  createTransferEvent,
  createCancelKeyEvent,
  createExpirationChangedEvent,
  createExpirationChangedEventUntilV11,
  createExpireKeyEvent,
  createKeyExtendedEvent,
  createKeyManagerChangedEvent,
  createRenewKeyPurchaseEvent,
  mockDataSourceV8,
  mockDataSourceV11,
  updateExpiration,
  updateExpirationV8,
  mockLockV11Erc20,
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

  test('Burn of a key', () => {
    const burnEvent = createTransferEvent(
      Address.fromString(keyOwnerAddress),
      Address.fromString(nullAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(burnEvent)
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
  test('should increase key timestamp (starting v12)', () => {
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
      BigInt.fromU64(expiration + 1000),
      true
    )

    handleExpirationChanged(newExpirationEvent)
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration + 1000}`)
    dataSourceMock.resetValues()
  })
  test('should increase key timestamp (until v11)', () => {
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
    const newExpirationEventUtilV11 = createExpirationChangedEventUntilV11(
      BigInt.fromU32(tokenId),
      BigInt.fromU32(1000),
      true
    )

    handleExpirationChangedUntilV11(newExpirationEventUtilV11)
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
    const newExpirationEvent = createExpirationChangedEventUntilV11(
      BigInt.fromU32(tokenId),
      BigInt.fromU32(1000),
      true
    )

    handleExpirationChangedUntilV11(newExpirationEvent)
    assert.fieldEquals('Key', keyIDV8, 'expiration', `${expiration + 1000}`)
    dataSourceMock.resetValues()
  })
})

describe('Extend key', () => {
  test('should increase key timestamp', () => {
    mockDataSourceV11()

    // mock and test
    updateExpiration(BigInt.fromU64(expiration + 5000))
    const newKeyExtended = createKeyExtendedEvent(
      BigInt.fromU32(tokenId),
      BigInt.fromU64(expiration + 5000),
      false
    )

    handleKeyExtended(newKeyExtended)
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration + 5000}`)
    dataSourceMock.resetValues()
  })

  test('should create receipt after key is extended on ERC20 lock', () => {
    mockLockV11Erc20()
    // create a key (that will create a receipt but that is not the one we want to test)
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
      BigInt.fromU64(expiration + 5000),
      true /** create ERC20 transfer event */
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
