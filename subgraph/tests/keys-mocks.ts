import { createMockedFunction } from 'matchstick-as/assembly/index'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { lockAddress, tokenId, tokenURI } from './constants'

createMockedFunction(
  Address.fromString(lockAddress),
  'tokenURI',
  'tokenURI(uint256):(string)'
)
  .withArgs([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(`${tokenId}`)),
  ])
  .returns([ethereum.Value.fromString(tokenURI)])
