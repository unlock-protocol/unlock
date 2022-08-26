import { createMockedFunction } from 'matchstick-as/assembly/index'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  defaultMockAddress,
  expiration,
  keyOwnerAddress,
  lockAddressV8,
  lockAddress,
  tokenId,
  tokenURI,
} from './constants'

// mock publicLock version contract call
createMockedFunction(
  Address.fromString(lockAddress),
  'publicLockVersion',
  'publicLockVersion():(uint16)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('11'))])

// key creation functions
createMockedFunction(
  Address.fromString(lockAddress),
  'tokenURI',
  'tokenURI(uint256):(string)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
  .returns([ethereum.Value.fromString(tokenURI)])

createMockedFunction(
  Address.fromString(lockAddress),
  'keyExpirationTimestampFor',
  'keyExpirationTimestampFor(uint256):(uint256)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(expiration))])

/**
 * Mocks function for < v10 locks
 */
createMockedFunction(
  Address.fromString(lockAddressV8),
  'publicLockVersion',
  'publicLockVersion():(uint16)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('9'))])

createMockedFunction(
  Address.fromString(lockAddressV8),
  'tokenURI',
  'tokenURI(uint256):(string)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
  .returns([ethereum.Value.fromString(tokenURI)])

createMockedFunction(
  Address.fromString(lockAddressV8),
  'keyExpirationTimestampFor',
  'keyExpirationTimestampFor(address):(uint256)'
)
  .withArgs([ethereum.Value.fromAddress(Address.fromString(keyOwnerAddress))])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(expiration))])

createMockedFunction(
  Address.fromString(lockAddressV8),
  'tokenOfOwnerByIndex',
  'tokenOfOwnerByIndex(address,uint256):(uint256)'
)
  .withArgs([
    ethereum.Value.fromAddress(Address.fromString(keyOwnerAddress)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(0)),
  ])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
