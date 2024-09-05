import {
  afterAll,
  assert,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  handleTransfer,
  handleExpireKey,
  handleExpirationChangedUntilV11,
  handleKeyManagerChanged,
  handleRenewKeyPurchase,
} from '../src/public-lock'
import {
  createTransferEvent,
  createExpirationChangedEventUntilV11,
  createExpireKeyEvent,
  createKeyManagerChangedEvent,
  createRenewKeyPurchaseEvent,
  mockDataSourceV8,
  updateExpirationV8,
} from './keys-utils'
import {
  keyOwnerAddress,
  now,
  nullAddress,
  tokenId,
  tokenURI,
  expiration,
  lockAddressV8,
  lockManagers,
} from './constants'

// mock contract functions
import './mocks'

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
    assert.fieldEquals('Key', keyIDV8, 'createdAt', '1')
    assert.fieldEquals('Key', keyIDV8, 'manager', lockManagers[0])
  })

  afterAll(() => {
    clearStore()
    dataSourceMock.resetValues()
  })
})

describe('Change in expiration timestamp', () => {
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

describe('Key is expired by lock manager', () => {
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
