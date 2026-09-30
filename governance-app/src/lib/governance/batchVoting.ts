import { Interface } from 'ethers'
import { governanceConfig } from '~/config/governance'

export const MAX_BATCH_VOTES = 20
export const BASE_CHAIN_ID_HEX = '0x2105'
export const VOTE_SUPPORT = { For: 1, Against: 0, Abstain: 2 } as const
export type VoteDirection = keyof typeof VOTE_SUPPORT

export type BatchCall = {
  to: string
  data: string
  value: string
}

const governorInterface = new Interface([
  'function castVote(uint256 proposalId, uint8 support)',
  'event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight, string reason)',
])

export function canSelectProposal(input: {
  state: string
  hasVoted: boolean
  votingPower: bigint
}) {
  if (input.state !== 'Active') return 'Only active proposals can be selected.'
  if (input.hasVoted) return 'This wallet has already voted on this proposal.'
  if (input.votingPower <= 0n)
    return 'This wallet has no voting power at the proposal snapshot.'
  return null
}

export function buildBatchCalls(
  proposalIds: string[],
  direction: VoteDirection
): BatchCall[] {
  if (!proposalIds.length) throw new Error('Select at least one proposal.')
  if (proposalIds.length > MAX_BATCH_VOTES)
    throw new Error(`Select no more than ${MAX_BATCH_VOTES} proposals.`)
  const support = VOTE_SUPPORT[direction]
  return proposalIds.map((proposalId) => ({
    to: governanceConfig.governorAddress,
    data: governorInterface.encodeFunctionData('castVote', [
      BigInt(proposalId),
      support,
    ]),
    value: '0x0',
  }))
}

export function buildWalletSendCalls(from: string, calls: BatchCall[]) {
  return {
    version: '2.0.0',
    chainId: BASE_CHAIN_ID_HEX,
    from,
    atomicRequired: true,
    calls,
  }
}

export function supportsAtomic(capabilities: any) {
  const atomic = capabilities?.[BASE_CHAIN_ID_HEX]?.atomic
  return atomic?.status === 'ready' || atomic?.status === 'supported'
}

export function verifyVoteCastLogs(
  receipts: Array<{
    status?: string | number
    logs?: Array<{ address?: string; topics?: string[]; data?: string }>
  }>,
  voter: string,
  proposalIds: string[],
  direction: VoteDirection
) {
  const expected = new Set(proposalIds)
  const found = new Set<string>()
  for (const receipt of receipts) {
    if (
      receipt.status !== undefined &&
      receipt.status !== '0x1' &&
      receipt.status !== 1 &&
      receipt.status !== '1'
    )
      return false
    for (const log of receipt.logs || []) {
      if (
        log.address?.toLowerCase() !==
          governanceConfig.governorAddress.toLowerCase() ||
        !log.topics?.length
      )
        continue
      try {
        const parsed = governorInterface.parseLog({
          topics: log.topics as string[],
          data: log.data || '0x',
        })
        if (!parsed || parsed.name !== 'VoteCast') continue
        const [logVoter, id, support] = parsed.args
        if (
          String(logVoter).toLowerCase() === voter.toLowerCase() &&
          String(support) === String(VOTE_SUPPORT[direction]) &&
          expected.has(String(id))
        )
          found.add(String(id))
      } catch {}
    }
  }
  return found.size === expected.size
}
