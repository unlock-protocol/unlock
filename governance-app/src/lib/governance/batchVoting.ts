import { Interface } from 'ethers'
import { governanceConfig } from '~/config/governance'

export const MAX_BATCH_VOTES = 50
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
])

export const INCOMPATIBLE_WALLET_MESSAGE =
  'Batch voting requires a compatible wallet such as MetaMask. This wallet is not compatible.'

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

export function getBatchVotingErrorMessage(
  error: unknown,
  proposalCount: number
) {
  const rpcError = error as { code?: unknown; message?: unknown } | null
  const code = Number(rpcError?.code)
  const message =
    typeof rpcError?.message === 'string' ? rpcError.message : undefined

  if (code === 5740 || /bundle too large/i.test(message || '')) {
    return `This wallet cannot process ${proposalCount} proposals in one batch. Select fewer proposals and try again.`
  }

  if (
    [-32601, 5700, 5710, 5760].includes(code) ||
    /method not found|method .* not supported/i.test(message || '')
  ) {
    return INCOMPATIBLE_WALLET_MESSAGE
  }

  return message || 'Wallet request failed.'
}
