'use client'

import { Contract, BrowserProvider, JsonRpcProvider } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { UPGovernor } from '@unlock-protocol/contracts'
import { Button, Modal } from '@unlock-protocol/ui'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'
import { governanceConfig } from '~/config/governance'
import { getContractAbi } from '~/lib/governance/composer'
import { ProposalCard } from './ProposalCard'
import { ProposalFilters } from './ProposalFilters'
import type { ProposalRecord } from '~/lib/governance/types'
import {
  buildBatchCalls,
  buildWalletSendCalls,
  canSelectProposal,
  MAX_BATCH_VOTES,
  supportsAtomic,
  type VoteDirection,
  VOTE_SUPPORT,
  verifyVoteCastLogs,
} from '~/lib/governance/batchVoting'

type OptimisticVote = {
  abstainVotes: bigint
  againstVotes: bigint
  forVotes: bigint
}

export function BatchVotingList({
  proposals,
  now,
  tokenSymbol,
  activeFilter,
}: {
  proposals: ProposalRecord[]
  now: bigint
  tokenSymbol: string
  activeFilter: string
}) {
  const wallet = useGovernanceWallet()
  const [selected, setSelected] = useState<string[]>([])
  const [direction, setDirection] = useState<VoteDirection | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [votedProposals, setVotedProposals] = useState<
    Map<string, number | null>
  >(() => new Map())
  const [optimisticVotes, setOptimisticVotes] = useState<
    Map<string, OptimisticVote>
  >(() => new Map())

  const activeProposals = useMemo(
    () => proposals.filter((proposal) => proposal.state === 'Active'),
    [proposals]
  )

  useEffect(() => {
    setSelected([])
    setDirection(null)
    setOptimisticVotes(new Map())
  }, [wallet.address])

  useEffect(() => {
    if (!wallet.address) {
      setVotedProposals(new Map())
      return
    }
    const address = wallet.address

    let cancelled = false
    const provider = new JsonRpcProvider(
      governanceConfig.rpcUrl,
      governanceConfig.chainId
    )
    const governor = new Contract(
      governanceConfig.governorAddress,
      getContractAbi(UPGovernor),
      provider
    )

    Promise.all(
      activeProposals.map(async (proposal) => ({
        id: proposal.id,
        hasVoted: await governor.hasVoted(BigInt(proposal.id), address),
        support: await fetchVoteSupport(proposal.id, address).catch(() => null),
      }))
    )
      .then((results) => {
        if (cancelled) return
        setVotedProposals((current) => {
          const next = new Map(current)
          for (const result of results) {
            if (!result.hasVoted) continue
            next.set(result.id, result.support ?? next.get(result.id) ?? null)
          }
          return next
        })
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [activeProposals, wallet.address])

  useEffect(() => {
    setSelected((current) =>
      current.filter((proposalId) => !votedProposals.has(proposalId))
    )
  }, [votedProposals])

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= MAX_BATCH_VOTES
          ? current
          : [...current, id]
    )
  }

  async function submit() {
    if (!wallet.address || !direction || !selected.length) return
    setBusy(true)
    setMessage('')
    try {
      const raw = await wallet.getProvider()
      const capabilities = await raw.request({
        method: 'wallet_getCapabilities',
        params: [wallet.address],
      })
      if (!supportsAtomic(capabilities)) {
        throw new Error(
          'Atomic batch voting is unavailable for this wallet on Base.'
        )
      }
      const provider = new BrowserProvider(raw, 'any')
      const governor = new Contract(
        governanceConfig.governorAddress,
        getContractAbi(UPGovernor),
        provider
      )
      const [clockMode, currentClock] = await Promise.all([
        governor.CLOCK_MODE(),
        governor.clock(),
      ])
      if (!String(clockMode).toLowerCase().includes('timestamp'))
        throw new Error(`Unsupported governor clock mode: ${clockMode}`)
      const checks = await Promise.all(
        selected.map(async (id) => {
          const proposal = proposals.find((item) => item.id === id)!
          if (proposal.voteStartTimestamp > BigInt(currentClock)) {
            return {
              id,
              votingPower: 0n,
              error: 'The proposal snapshot is not available yet.',
            }
          }
          const [hasVoted, votingPower] = await Promise.all([
            governor.hasVoted(BigInt(id), wallet.address),
            governor.getVotes(wallet.address, proposal.voteStartTimestamp),
          ])
          return {
            id,
            votingPower,
            error: canSelectProposal({
              state: proposal.state,
              hasVoted,
              votingPower,
            }),
          }
        })
      )
      if (checks.some((check) => check.error)) {
        setSelected([])
        setDirection(null)
        throw new Error(
          'One or more selected proposals can no longer be voted on.'
        )
      }
      const calls = buildBatchCalls(selected, direction)
      const result = await raw.request({
        method: 'wallet_sendCalls',
        params: [buildWalletSendCalls(wallet.address, calls)],
      })
      let status: any
      for (let i = 0; i < 30; i++) {
        status = await raw.request({
          method: 'wallet_getCallsStatus',
          params: [result],
        })
        if (status?.status === '0x1' || status?.status === 1) break
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      if (status?.atomic !== true)
        throw new Error('Wallet completed without an atomic status.')
      if (status?.status !== '0x1' && status?.status !== 1)
        throw new Error('Atomic batch did not succeed.')
      const receipts = status.receipts || []
      if (!verifyVoteCastLogs(receipts, wallet.address, selected, direction))
        throw new Error(
          'Receipt verification failed: VoteCast logs did not match the selected batch.'
        )
      for (const id of selected)
        if (!(await governor.hasVoted(BigInt(id), wallet.address)))
          throw new Error(`Postcondition failed for proposal ${id}.`)
      const support = VOTE_SUPPORT[direction]
      setVotedProposals((current) => {
        const next = new Map(current)
        for (const { id } of checks) next.set(id, support)
        return next
      })
      setOptimisticVotes((current) => {
        const next = new Map(current)
        for (const { id, votingPower } of checks) {
          const proposal = proposals.find((item) => item.id === id)!
          next.set(id, {
            forVotes: proposal.forVotes + (support === 1 ? votingPower : 0n),
            againstVotes:
              proposal.againstVotes + (support === 0 ? votingPower : 0n),
            abstainVotes:
              proposal.abstainVotes + (support === 2 ? votingPower : 0n),
          })
        }
        return next
      })
      setMessage(
        `Verified atomic ${direction} batch: ${selected.length} proposals updated successfully.`
      )
      setSelected([])
      setDirection(null)
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Wallet request failed.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="sticky top-4 z-10 rounded-2xl border border-brand-ui-primary/10 bg-white p-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <strong>{selected.length} selected</strong>
            <button
              className="text-sm underline"
              onClick={() => setSelected([])}
            >
              Clear selection
            </button>
            <span className="mx-1 h-5 w-px bg-brand-ui-primary/15" />
            {(['For', 'Against', 'Abstain'] as VoteDirection[]).map((item) => (
              <button
                key={item}
                onClick={() => setDirection(item)}
                className={`rounded-full border px-3 py-1 text-sm ${direction === item ? 'border-brand-ui-primary bg-brand-ui-primary text-white' : 'border-brand-ui-primary/15'}`}
              >
                {item}
              </button>
            ))}
            {direction && (
              <button
                disabled={busy}
                onClick={() => setReviewOpen(true)}
                className="rounded-full bg-brand-ui-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Review & submit {selected.length} {direction} vote
                {selected.length === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </div>
      )}
      <ProposalFilters activeFilter={activeFilter} />
      {message && (
        <p className="rounded-xl bg-white p-4 text-sm" role="status">
          {message}
        </p>
      )}
      <Modal isOpen={reviewOpen} setIsOpen={setReviewOpen} size="small">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-brand-ui-primary">
              Review batch vote
            </h2>
            <p className="text-sm leading-6 text-brand-ui-primary/70">
              Cast {direction} votes for {selected.length} selected proposal
              {selected.length === 1 ? '' : 's'} in one atomic Base batch.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-full px-4 py-2 text-sm font-medium text-brand-ui-primary"
              onClick={() => setReviewOpen(false)}
            >
              Cancel
            </button>
            <Button
              disabled={busy}
              onClick={() => {
                setReviewOpen(false)
                submit()
              }}
            >
              Continue to wallet
            </Button>
          </div>
        </div>
      </Modal>
      <div className="grid gap-5">
        {proposals.map((proposal) => {
          const optimisticVote = optimisticVotes.get(proposal.id)
          const displayedProposal = optimisticVote
            ? {
                ...proposal,
                forVotes: max(proposal.forVotes, optimisticVote.forVotes),
                againstVotes: max(
                  proposal.againstVotes,
                  optimisticVote.againstVotes
                ),
                abstainVotes: max(
                  proposal.abstainVotes,
                  optimisticVote.abstainVotes
                ),
              }
            : proposal
          return (
            <ProposalCard
              key={proposal.id}
              now={now}
              proposal={displayedProposal}
              tokenSymbol={tokenSymbol}
              selectable={proposal.state === 'Active'}
              selectionDisabled={votedProposals.has(proposal.id)}
              selected={selected.includes(proposal.id)}
              onToggle={() => toggle(proposal.id)}
              votedSupport={votedProposals.get(proposal.id)}
            />
          )
        })}
      </div>
    </>
  )
}

function max(left: bigint, right: bigint) {
  return left > right ? left : right
}

async function fetchVoteSupport(
  proposalId: string,
  voter: string
): Promise<number | null> {
  const id = `${proposalId}-${voter.toLowerCase()}`
  const response = await fetch(governanceConfig.subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'query ($id: ID!) { vote(id: $id) { support } }',
      variables: { id },
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok)
    throw new Error(`Subgraph request failed: ${response.status}`)
  const json = await response.json()
  const support = Number(json?.data?.vote?.support)
  return [0, 1, 2].includes(support) ? support : null
}
