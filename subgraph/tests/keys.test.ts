import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { handleTransfer } from '../src/public-lock'
import { createTransferEvent } from './keys-utils'
import { keyOwnerAddress, nullAddress, tokenId, tokenURI } from './constants'

// mock contract functions
import './keys-mocks'

describe('Describe keys', () => {
  beforeAll(() => {
    const newTransferEvent = createTransferEvent(
      Address.fromString(nullAddress),
      Address.fromString(keyOwnerAddress),
      BigInt.fromI32(tokenId)
    )
    handleTransfer(newTransferEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('Transfer of a new key', () => {
    assert.entityCount('Key', 1)

    assert.fieldEquals(
      'Key',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'owner',
      keyOwnerAddress
    )
    assert.fieldEquals(
      'Key',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'tokenId',
      `${tokenId}`
    )
    assert.fieldEquals(
      'Key',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
      'tokenURI',
      `${tokenURI}`
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
