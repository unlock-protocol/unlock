import {
  ethereum,
  Address,
  BigInt,
  Bytes,
  Wrapped,
  log,
} from '@graphprotocol/graph-ts'
import {
  keyOwnerAddress,
  keyPrice,
  lockAddress,
  lockOwner,
  tokenAddress,
  tokenId,
} from './constants'

const defaultAddress = Address.fromString(
  '0xA16081F360e3847006dB660bae1c6d1b2e17eC2A'
)
const defaultAddressBytes = defaultAddress as Bytes
const defaultBigInt = BigInt.fromI32(1)
const defaultIntBytes = Bytes.fromI32(1)
const defaultEventDataLogType = 'default_log_type'

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

function createCancelKeyEventLog(
  tokenId: BigInt,
  owner: Address,
  sendTo: Address,
  refund: BigInt
): ethereum.Log {
  const eventSignature = defaultAddressBytes
  const topics = [
    eventSignature,
    bigIntToBytes(tokenId),
    addressToTopic(owner),
    addressToTopic(sendTo),
  ]
  const data = bigIntToBytes(refund)
  return new ethereum.Log(
    Address.fromString(lockAddress),
    topics,
    data,
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

function createTransferEventLog(
  tokenAddress: Address,
  from: Address,
  to: Address,
  value: BigInt
): ethereum.Log {
  const eventSignature = Bytes.fromHexString(
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  )
  const topics = [eventSignature, addressToTopic(from), addressToTopic(to)]
  const data = bigIntToBytes(value)
  return new ethereum.Log(
    tokenAddress,
    topics,
    data,
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

// Here you would insert these logs into your mock transaction receipt
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
        refund
      ),
      createTransferEventLog(
        tokenAddress,
        Address.fromString(lockAddress),
        Address.fromString(keyOwnerAddress),
        refund
      ),
    ],
    defaultBigInt,
    defaultAddressBytes,
    defaultAddressBytes
  )
}
