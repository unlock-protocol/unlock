import {
  ethereum,
  Address,
  BigInt,
  Bytes,
  Wrapped,
  ByteArray,
} from '@graphprotocol/graph-ts'
import {
  defaultMockAddress,
  keyOwnerAddress,
  keyPrice,
  unlockAddress,
  lockAddress,
  lockOwner,
  nullAddress,
  tokenId,
  GNP_CHANGED_TOPIC0,
} from './constants'

const defaultAddress = Address.fromString(defaultMockAddress)
const defaultAddressBytes = defaultAddress as Bytes
const defaultBigInt = BigInt.fromU32(keyPrice)
const defaultIntBytes = Bytes.fromUint8Array(defaultBigInt.reverse())
const defaultZeroIntBytes = Bytes.fromI32(0)

export function bigIntToBytes(num: BigInt): Bytes {
  return Bytes.fromUint8Array(stripZeros(Bytes.fromBigInt(num).reverse()))
}

export function bigIntToTopic(num: BigInt): Bytes {
  const bigIntHex = bigIntToBytes(num).toHexString().slice(2)
  const paddedHex = bigIntHex.padStart(64, '0')
  return Bytes.fromHexString('0x' + paddedHex) as Bytes
}

export function stripZeros(bytes: Uint8Array): ByteArray {
  let i = 0
  while (i < bytes.length && bytes[i] == 0) {
    i++
  }
  return Bytes.fromUint8Array(bytes.slice(i))
}

function addressToTopic(address: Address): Bytes {
  // Convert the address to a hex string, remove the leading 0x
  const addressHex = address.toHexString().slice(2)
  // Pad the hex string to 64 characters (32 bytes when converted back to bytes)
  const paddedHex = addressHex.padStart(64, '0')
  // Convert back to Bytes and return
  return Bytes.fromHexString('0x' + paddedHex) as Bytes
}

// Create CancelKey event log for the receipt
function createCancelKeyEventLog(
  tokenId: BigInt,
  owner: Address,
  sendTo: Address,
  refund: Bytes
): ethereum.Log {
  const eventSignature = defaultAddressBytes
  const topics = [
    eventSignature,
    bigIntToTopic(tokenId),
    addressToTopic(owner),
    addressToTopic(sendTo),
  ]
  return new ethereum.Log(
    Address.fromString(lockAddress),
    topics,
    refund,
    defaultAddressBytes,
    defaultIntBytes,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    'CancelKey',
    new Wrapped(false)
  )
}

// Create transfrer event log for the receipt
function createTransferEventLog(
  tokenAddress: Address,
  from: Address,
  to: Address,
  value: Bytes
): ethereum.Log {
  const eventSignature = Bytes.fromHexString(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  )
  const topics = [eventSignature, addressToTopic(from), addressToTopic(to)]
  return new ethereum.Log(
    tokenAddress,
    topics,
    value,
    defaultAddressBytes,
    defaultIntBytes,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    'Transfer',
    new Wrapped(false)
  )
}

// Create transaction receipt for mock transaction
export function newTransactionReceipt(
  logs: ethereum.Log[]
): ethereum.TransactionReceipt {
  return new ethereum.TransactionReceipt(
    defaultAddressBytes,
    defaultBigInt,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultAddress,
    logs,
    defaultBigInt,
    defaultAddressBytes,
    defaultAddressBytes
  )
}

// Create transaction receipt for mock transaction
export function newCancelKeyTransactionReceipt(
  tokenAddress: Address,
  refund: BigInt
): ethereum.TransactionReceipt {
  return newTransactionReceipt([
    createCancelKeyEventLog(
      BigInt.fromU32(tokenId),
      Address.fromString(lockOwner),
      Address.fromString(keyOwnerAddress),
      refund > BigInt.fromU32(0) ? defaultIntBytes : defaultZeroIntBytes
    ),
    // This Log shouldn't be there if the tokenAddress is nullAddress but id does not really matter
    createTransferEventLog(
      tokenAddress,
      Address.fromString(lockAddress),
      Address.fromString(keyOwnerAddress),
      refund > BigInt.fromU32(0) ? defaultIntBytes : defaultZeroIntBytes
    ),
  ])
}

// adds a GNPChanged event to the tx receipt
export function newGNPChangedTransactionReceipt(
  keyValue: BigInt,
  totalValue: BigInt
): ethereum.TransactionReceipt {
  const eventSignature = Bytes.fromHexString(GNP_CHANGED_TOPIC0)
  const grossNetworkProduct = BigInt.fromU32(0)

  // as the tx is sent from another contract (NOT the lock)
  // only the event signature is passed as topics[0]
  // the rest of the log topics are passed as data
  const topics = [eventSignature]

  const GNPChangedValues: Array<ethereum.Value> = [
    ethereum.Value.fromUnsignedBigInt(grossNetworkProduct),
    ethereum.Value.fromUnsignedBigInt(keyValue),
    ethereum.Value.fromAddress(Address.fromString(nullAddress)),
    ethereum.Value.fromUnsignedBigInt(keyValue),
    ethereum.Value.fromAddress(Address.fromString(lockAddress)),
  ]
  const values = changetype<ethereum.Tuple>(GNPChangedValues)

  return newTransactionReceipt([
    new ethereum.Log(
      Address.fromString(unlockAddress),
      topics,
      ethereum.encode(ethereum.Value.fromTuple(values))!,
      defaultAddressBytes,
      defaultIntBytes,
      defaultAddressBytes,
      defaultBigInt,
      defaultBigInt,
      defaultBigInt,
      'GNPChanged',
      new Wrapped(false)
    ),
  ])
}
