import { createMockedFunction } from 'matchstick-as/assembly/index'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { defaultMockAddress, tokenId, tokenURI, expiration } from './constants'

createMockedFunction(
  Address.fromString(defaultMockAddress),
  'tokenURI',
  'tokenURI(uint256):(string)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
  .returns([ethereum.Value.fromString(tokenURI)])

createMockedFunction(
  Address.fromString(defaultMockAddress),
  'keyExpirationTimestampFor',
  'keyExpirationTimestampFor(uint256):(uint256)'
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(tokenId))])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(expiration))])
