import { createMockedFunction } from 'matchstick-as/assembly/index'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  duration,
  expiration,
  keyOwnerAddress,
  lockAddressV8,
  lockAddress,
  tokenId,
  tokenURI,
  symbol,
  nullAddress,
  keyPrice,
  baseTokenURI,
  maxNumberOfKeys,
  maxKeysPerAddress,
} from './constants'

createMockedFunction(
  Address.fromString(lockAddress),
  'tokenAddress',
  'tokenAddress():(address)'
)
  .withArgs([])
  .returns([ethereum.Value.fromAddress(Address.fromString(nullAddress))])

createMockedFunction(
  Address.fromString(lockAddress),
  'keyPrice',
  'keyPrice():(uint256)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(keyPrice))])

createMockedFunction(Address.fromString(lockAddress), 'name', 'name():(string)')
  .withArgs([])
  .returns([ethereum.Value.fromString('My lock graph')])

createMockedFunction(
  Address.fromString(lockAddress),
  'symbol',
  'symbol():(string)'
)
  .withArgs([])
  .returns([ethereum.Value.fromString(symbol)])

// tokenURIs
createMockedFunction(
  Address.fromString(lockAddress),
  'tokenURI',
  'tokenURI(uint256):(string)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(0))])
  .returns([ethereum.Value.fromString(baseTokenURI)])

// mock publicLock version contract call
createMockedFunction(
  Address.fromString(lockAddress),
  'publicLockVersion',
  'publicLockVersion():(uint16)'
)
  .withArgs([])
  .returns([ethereum.Value.fromI32(BigInt.fromString('11').toI32())])

// before v9, publicLockVersion was returning uint16
createMockedFunction(
  Address.fromString(lockAddress),
  'publicLockVersion',
  'publicLockVersion():(uint256)'
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
  'expirationDuration',
  'expirationDuration():(uint256)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(duration))])

createMockedFunction(
  Address.fromString(lockAddress),
  'maxNumberOfKeys',
  'maxNumberOfKeys():(uint256)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(maxNumberOfKeys))])

createMockedFunction(
  Address.fromString(lockAddress),
  'maxKeysPerAddress',
  'maxKeysPerAddress():(uint256)'
)
  .withArgs([])
  .returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(maxKeysPerAddress)),
  ])

createMockedFunction(
  Address.fromString(lockAddress),
  'keyExpirationTimestampFor',
  'keyExpirationTimestampFor(uint256):(uint256)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(expiration))])

/**
 * Mocks function for v8 locks
 */
createMockedFunction(
  Address.fromString(lockAddressV8),
  'publicLockVersion',
  'publicLockVersion():(uint16)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('8'))])

createMockedFunction(
  Address.fromString(lockAddressV8),
  'maxNumberOfKeys',
  'maxNumberOfKeys():(uint256)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(maxNumberOfKeys))])

createMockedFunction(
  Address.fromString(lockAddressV8),
  'keyPrice',
  'keyPrice():(uint256)'
)
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(keyPrice))])

createMockedFunction(
  Address.fromString(lockAddressV8),
  'name',
  'name():(string)'
)
  .withArgs([])
  .returns([ethereum.Value.fromString('My lock v8')])

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
