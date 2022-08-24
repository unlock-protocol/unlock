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
import {
  defaultMockAddress,
  keyOwnerAddress,
  nullAddress,
  tokenId,
  tokenURI,
} from './constants'

// mock contract functions
import './keys-mocks'

describe('Describe keys', () => {
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

  test('Transfer of a new key', () => {
    assert.entityCount('Key', 1)
    const keyID = `${defaultMockAddress}-${tokenId}`
    assert.fieldEquals('Key', keyID, 'lock', defaultMockAddress)
    assert.fieldEquals('Key', keyID, 'owner', keyOwnerAddress)
    assert.fieldEquals('Key', keyID, 'tokenId', `${tokenId}`)
    assert.fieldEquals('Key', keyID, 'tokenURI', `${tokenURI}`)
    assert.fieldEquals('Key', keyID, 'createdAtBlock', '1')
  })
})
