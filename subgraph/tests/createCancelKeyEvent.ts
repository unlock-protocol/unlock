import {
  ethereum,
  Address,
  BigInt,
  Bytes,
  Wrapped,
} from '@graphprotocol/graph-ts'
import {
  defaultMockAddress,
  keyOwnerAddress,
  keyPrice,
  lockAddress,
  lockOwner,
  nullAddress,
  tokenId,
} from './constants'

const defaultAddress = Address.fromString(defaultMockAddress)
const defaultAddressBytes = defaultAddress as Bytes
const defaultBigInt = BigInt.fromI32(keyPrice)
const defaultIntBytes = Bytes.fromI32(keyPrice)
const defaultZeroIntBytes = Bytes.fromI32(0)

function bigIntToBytes(bi: BigInt): Bytes {
  let hexString = bi.toHexString()
  // Remove the '0x' prefix and pad the hex string to be even length
  hexString = hexString
    .slice(2)
    .padStart(
      hexString.length % 2 == 0 ? hexString.length : hexString.length + 1,
      '0'
    )
  return Bytes.fromHexString('0x' + hexString) as Bytes
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
    bigIntToBytes(tokenId),
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
  tokenAddress: Address,
  refund: BigInt
): ethereum.TransactionReceipt {
  return new ethereum.TransactionReceipt(
    defaultAddressBytes,
    defaultBigInt,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultAddress,
    [
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
    ],
    defaultBigInt,
    defaultAddressBytes,
    defaultAddressBytes
  )
}
