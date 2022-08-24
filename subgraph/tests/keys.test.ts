import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  handleTransfer,
  handleExpirationChanged,
  handleKeyManagerChanged,
} from '../src/public-lock'
import {
  createTransferEvent,
  createExpirationChangedEvent,
  createKeyManagerChangedEvent,
} from './keys-utils'
import {
  defaultMockAddress,
  keyOwnerAddress,
  nullAddress,
  tokenId,
  tokenURI,
  expiration,
} from './constants'

// mock contract functions
import './mocks'
import { Key } from '../generated/schema'

const keyID = `${defaultMockAddress}-${tokenId}`

describe('Key transfers', () => {
  beforeAll(() => {
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
    assert.fieldEquals('Key', keyID, 'lock', defaultMockAddress)
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

describe('Key managers', () => {
  const newKeyManagerAddress = '0x0000000000000000000000000000000000000132'

  beforeAll(() => {
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)
  })

  test('key manager changed', () => {
    const newKeyManagerChanged = createKeyManagerChangedEvent(
      BigInt.fromU32(tokenId),
      Address.fromString(newKeyManagerAddress)
    )

    handleKeyManagerChanged(newKeyManagerChanged)
    assert.fieldEquals('Key', keyID, 'manager', newKeyManagerAddress)
  })
})
