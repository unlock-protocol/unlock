import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import {
  Address,
  BigInt,
  Bytes,
  Wrapped,
  ethereum,
} from '@graphprotocol/graph-ts'
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
  mockDataSourceV11,
  updateExpiration,
} from './keys-utils'
import {
  keyOwnerAddress,
  now,
  nullAddress,
  tokenId,
  tokenURI,
  expiration,
  lockAddress,
  lockManagers,
} from './constants'
import { bigIntToTopic, newTransactionReceipt } from './mockTxReceipt'

// mock contract functions
import './mocks'

const keyID = `${lockAddress}-${tokenId}`
const secondTokenId = tokenId + 1
const secondKeyID = `${lockAddress}-${secondTokenId}`
const erc721TransferTopic0 =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const structPurchaseSelector = '0x4609b39b'

function addressToTopic(address: Address): Bytes {
  const addressHex = address.toHexString().slice(2)
  const paddedHex = addressHex.padStart(64, '0')
  return Bytes.fromHexString('0x' + paddedHex) as Bytes
}

function createMintTransferLog(
  tokenId: BigInt,
  transactionLogIndex: u32
): ethereum.Log {
  const defaultBytes = Bytes.fromHexString('0x00')
  const defaultBigInt = BigInt.fromU32(0)
  return new ethereum.Log(
    Address.fromString(lockAddress),
    [
      Bytes.fromHexString(erc721TransferTopic0),
      addressToTopic(Address.fromString(nullAddress)),
      addressToTopic(Address.fromString(keyOwnerAddress)),
      bigIntToTopic(tokenId),
    ],
    Bytes.fromHexString('0x'),
    defaultBytes,
    defaultBytes,
    defaultBytes,
    defaultBigInt,
    BigInt.fromU32(transactionLogIndex),
    BigInt.fromU32(transactionLogIndex),
    'Transfer',
    new Wrapped(false)
  )
}

function createStructPurchaseInput(referrers: Address[]): Bytes {
  const purchaseArgs = new Array<ethereum.Tuple>(referrers.length)
  for (let i = 0; i < referrers.length; i++) {
    const purchaseArgValues: Array<ethereum.Value> = [
      ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(0)),
      ethereum.Value.fromAddress(Address.fromString(keyOwnerAddress)),
      ethereum.Value.fromAddress(referrers[i]),
      ethereum.Value.fromAddress(Address.fromString(nullAddress)),
      ethereum.Value.fromAddress(Address.fromString(nullAddress)),
      ethereum.Value.fromBytes(Bytes.fromHexString('0x')),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(0)),
    ]
    purchaseArgs[i] = changetype<ethereum.Tuple>(purchaseArgValues)
  }

  const purchaseValues: Array<ethereum.Value> = [
    ethereum.Value.fromTupleArray(purchaseArgs),
  ]
  const encoded = ethereum.encode(
    ethereum.Value.fromTuple(changetype<ethereum.Tuple>(purchaseValues))
  )!

  return changetype<Bytes>(
    Bytes.fromHexString(structPurchaseSelector).concat(encoded)
  )
}

describe('Burn a key', () => {
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

  test('key is removed from graph', () => {
    const burnEvent = createTransferEvent(
      Address.fromString(keyOwnerAddress),
      Address.fromString(nullAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(burnEvent)
    assert.notInStore('Key', keyID)
  })
})

describe('Key transfers', () => {
  beforeAll(() => {
    mockDataSourceV11()
  })

  afterAll(() => {
    clearStore()
  })

  test('Creation of a new key', () => {
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)
    assert.entityCount('Key', 1)
    assert.fieldEquals('Key', keyID, 'lock', lockAddress)
    assert.fieldEquals('Key', keyID, 'owner', keyOwnerAddress)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)
    assert.fieldEquals('Key', keyID, 'tokenURI', `${tokenURI}`)
    assert.fieldEquals('Key', keyID, 'expiration', `${expiration}`)
    assert.fieldEquals('Key', keyID, 'createdAtBlock', '1')
    const hash = newTransferEvent.transaction.hash.toHexString()
    assert.fieldEquals('Key', keyID, 'transactionsHash', `[${hash}]`)
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
  test('should have transaction hash', () => {
    mockDataSourceV11()
    // create a key
    const newExpireKeyEvent = createExpireKeyEvent(BigInt.fromU32(tokenId))

    const hash = newExpireKeyEvent.transaction.hash.toHexString()

    // check for transactionHash
    assert.fieldEquals('Key', keyID, 'transactionsHash', `[${hash}]`)
    dataSourceMock.resetValues()
  })

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
})

describe('Key managers', () => {
  const newKeyManagerAddress = '0x0000000000000000000000000000000000000132'

  test('should have transaction hash', () => {
    mockDataSourceV11()
    // create a key

    const newKeyManagerChanged = createKeyManagerChangedEvent(
      BigInt.fromU32(tokenId),
      Address.fromString(newKeyManagerAddress)
    )

    handleKeyManagerChanged(newKeyManagerChanged)

    const hash = newKeyManagerChanged.transaction.hash.toHexString()

    // check for transactionHash
    assert.fieldEquals('Key', keyID, 'transactionsHash', `[${hash}]`)
    dataSourceMock.resetValues()
  })

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
})

describe('Cancel keys', () => {
  test('should have transaction hash', () => {
    mockDataSourceV11()
    // create a key

    const newCancelKey = createCancelKeyEvent(
      Address.fromString(nullAddress),
      BigInt.fromU32(tokenId),
      BigInt.fromU32(0)
    )
    handleCancelKey(newCancelKey)
    const hash = newCancelKey.transaction.hash.toHexString()
    // check for transactionHash
    assert.fieldEquals('Key', keyID, 'transactionsHash', `[${hash}]`)
    dataSourceMock.resetValues()
  })

  test('cancel a key', () => {
    mockDataSourceV11()
    // create a key
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    handleTransfer(newTransferEvent)

    const newCancelKey = createCancelKeyEvent(
      Address.fromString(nullAddress),
      BigInt.fromU32(tokenId),
      BigInt.fromU32(0)
    )
    handleCancelKey(newCancelKey)
    assert.fieldEquals('Key', keyID, 'cancelled', 'true')
    assert.fieldEquals('Key', keyID, 'owner', nullAddress)
    dataSourceMock.resetValues()
  })
})

describe('RenewKeyPurchase', () => {
  test('should add the new transaction to the list of transactions', () => {
    mockDataSourceV11()
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    const creationHash =
      '0x0000000000000000000000000000000000000000000000000000000000000001'

    newTransferEvent.transaction.hash = Bytes.fromHexString(creationHash)
    handleTransfer(newTransferEvent)
    assert.fieldEquals('Key', keyID, 'transactionsHash', `[${creationHash}]`)
    const newExpiration = expiration + 1000
    const newRenewKeyPurchase = createRenewKeyPurchaseEvent(
      Address.fromString(keyOwnerAddress),
      BigInt.fromU64(newExpiration)
    )
    const renewHash =
      '0x0000000000000000000000000000000000000000000000000000000000000002'
    newRenewKeyPurchase.transaction.hash = Bytes.fromHexString(renewHash)
    handleRenewKeyPurchase(newRenewKeyPurchase)
    assert.fieldEquals(
      'Key',
      keyID,
      'transactionsHash',
      `[${creationHash}, ${renewHash}]`
    )
  })
})

describe('Key referrer', () => {
  afterAll(() => {
    clearStore()
  })

  test('stores the matching purchase referrer on newly minted keys', () => {
    mockDataSourceV11()
    const firstReferrer = Address.fromString(lockManagers[0])
    const secondReferrer = Address.fromString(lockManagers[1])
    const input = createStructPurchaseInput([firstReferrer, secondReferrer])
    const receipt = newTransactionReceipt([
      createMintTransferLog(BigInt.fromU32(tokenId), 4),
      createMintTransferLog(BigInt.fromU32(secondTokenId), 5),
    ])

    const firstTransfer = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(tokenId)
    )
    firstTransfer.transaction.input = input
    firstTransfer.transactionLogIndex = BigInt.fromU32(4)
    firstTransfer.receipt = receipt

    const secondTransfer = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromU32(secondTokenId)
    )
    secondTransfer.transaction.input = input
    secondTransfer.transactionLogIndex = BigInt.fromU32(5)
    secondTransfer.receipt = receipt

    handleTransfer(firstTransfer)
    handleTransfer(secondTransfer)

    assert.fieldEquals('Key', keyID, 'referrer', lockManagers[0])
    assert.fieldEquals('Key', secondKeyID, 'referrer', lockManagers[1])
  })
})
