import { describe, expect, it } from 'vitest'
import {
  buildBatchCalls,
  buildWalletSendCalls,
  canSelectProposal,
  MAX_BATCH_VOTES,
  supportsAtomic,
  VOTE_SUPPORT,
} from './batchVoting'

describe('batch voting guards', () => {
  it('caps requests at fifty proposals', () => {
    expect(() =>
      buildBatchCalls(
        Array.from({ length: MAX_BATCH_VOTES + 1 }, (_, i) => String(i)),
        'Against'
      )
    ).toThrow('50')
    expect(buildBatchCalls(['1', '2'], 'Against')).toHaveLength(2)
  })

  it('constructs fixed atomic Base calls with the shared direction', () => {
    const calls = buildBatchCalls(['123'], 'Against')
    const request = buildWalletSendCalls(
      '0x0000000000000000000000000000000000000001',
      calls
    )
    expect(request).toMatchObject({
      chainId: '0x2105',
      atomicRequired: true,
      version: '2.0.0',
    })
    expect(calls[0]).toMatchObject({ value: '0x0' })
    expect(calls[0].to).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(VOTE_SUPPORT.Against).toBe(0)
  })

  it('only allows active, unvoted proposals with positive power', () => {
    expect(
      canSelectProposal({ state: 'Pending', hasVoted: false, votingPower: 1n })
    ).toMatch(/active/i)
    expect(
      canSelectProposal({ state: 'Active', hasVoted: true, votingPower: 1n })
    ).toMatch(/already voted/)
    expect(
      canSelectProposal({ state: 'Active', hasVoted: false, votingPower: 0n })
    ).toMatch(/no voting power/)
    expect(
      canSelectProposal({ state: 'Active', hasVoted: false, votingPower: 1n })
    ).toBeNull()
  })

  it('accepts only ready or supported atomic capability states', () => {
    expect(supportsAtomic({ '0x2105': { atomic: { status: 'ready' } } })).toBe(
      true
    )
    expect(
      supportsAtomic({ '0x2105': { atomic: { status: 'supported' } } })
    ).toBe(true)
    expect(
      supportsAtomic({ '0x2105': { atomic: { status: 'unsupported' } } })
    ).toBe(false)
  })
})
