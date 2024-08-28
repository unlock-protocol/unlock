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
  mockDataSourceV9,
  updateExpirationV9,
} from './keys-utils'
import {
  keyOwnerAddress,
  now,
  nullAddress,
  tokenId,
  tokenURI,
  expiration,
  lockAddressV9,
  lockManagers,
} from './constants'

// mock contract functions
import './mocks'

const keyIDV9 = `${lockAddressV9}-${tokenId}`

describe('Key transfers (V9)', () => {
  test('Creation of a new key (V9)', () => {
    mockDataSourceV9()
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyIDV9, 'lock', lockAddressV9)
    assert.fieldEquals('Key', keyIDV9, 'owner', keyOwnerAddress)
    assert.fieldEquals('Key', keyIDV9, 'tokenId', `${tokenId}`)
    assert.fieldEquals('Key', keyIDV9, 'tokenURI', `${tokenURI}`)
    assert.fieldEquals('Key', keyIDV9, 'expiration', `${expiration}`)
    assert.fieldEquals('Key', keyIDV9, 'createdAtBlock', '1')
    assert.fieldEquals('Key', keyIDV9, 'createdAt', '1')
    assert.fieldEquals('Key', keyIDV9, 'manager', lockManagers[0])
  })

  afterAll(() => {
    clearStore()
    dataSourceMock.resetValues()
  })
})

describe('Change in expiration timestamp', () => {
  test('should increase key timestamp (V9)', () => {
    mockDataSourceV9()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpirationV9(BigInt.fromU64(expiration + 1000))
    const newExpirationEvent = createExpirationChangedEventUntilV11(
      BigInt.fromU32(tokenId),
      BigInt.fromU32(1000),
      true
    )

    handleExpirationChangedUntilV11(newExpirationEvent)
    assert.fieldEquals('Key', keyIDV9, 'expiration', `${expiration + 1000}`)
    dataSourceMock.resetValues()
  })
})

describe('Key is expired by lock manager', () => {
  test('should update the key expiration (V9)', () => {
    mockDataSourceV9()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    // mock and test
    updateExpirationV9()
    const newExpireKeyEvent = createExpireKeyEvent(BigInt.fromU32(tokenId))

    handleExpireKey(newExpireKeyEvent)
    assert.fieldEquals('Key', keyIDV9, 'expiration', `${now}`)
    dataSourceMock.resetValues()
  })
})

describe('Key managers', () => {
  const newKeyManagerAddress = '0x0000000000000000000000000000000000000132'

  test('key manager changed (V9)', () => {
    mockDataSourceV9()

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
    assert.fieldEquals('Key', keyIDV9, 'manager', newKeyManagerAddress)
    dataSourceMock.resetValues()
  })
})

describe('RenewKeyPurchase (lock <v10)', () => {
  test('extend a key by the correct time (V9)', () => {
    mockDataSourceV9()

    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    updateExpirationV9()
    const newExpiration = expiration + 1000
    const newRenewKeyPurchase = createRenewKeyPurchaseEvent(
      Address.fromString(keyOwnerAddress),
      BigInt.fromU64(newExpiration)
    )
    handleRenewKeyPurchase(newRenewKeyPurchase)
    assert.fieldEquals('Key', keyIDV9, 'expiration', `${newExpiration}`)
    dataSourceMock.resetValues()
  })
})
