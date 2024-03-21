import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { ReferrerFee } from '../generated/templates/PublicLock/PublicLock'

export function createReferrerEvent(
  referrer: Address,
  fee: BigInt
): ReferrerFee {
  const referrerEvent = changetype<ReferrerFee>(newMockEvent())

  referrerEvent.parameters = []

  referrerEvent.parameters.push(
    new ethereum.EventParam('referrer', ethereum.Value.fromAddress(referrer))
  )

  referrerEvent.parameters.push(
    new ethereum.EventParam('fee', ethereum.Value.fromUnsignedBigInt(fee))
  )

  return referrerEvent
}
