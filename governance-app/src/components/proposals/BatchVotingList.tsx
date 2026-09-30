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
  verifyVoteCastLogs,
} from '~/lib/governance/batchVoting'

type BatchCallStatus = {
  receipts?: Array<{
    logs?: Array<{ address?: string; data?: string; topics?: string[] }>
    status?: number | string
  }>
  status?: unknown
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
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [votedProposals, setVotedProposals] = useState<
    Map<string, number | null>
  >(() => new Map())

  const activeProposals = useMemo(
    () => proposals.filter((proposal) => proposal.state === 'Active'),
    [proposals]
  )

  useEffect(() => {
    setSelected([])
    setDirection(null)
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
      activeProposals.map(async (proposal) => {
        const hasVoted = await governor.hasVoted(BigInt(proposal.id), address)
        return {
          id: proposal.id,
          hasVoted,
          support: await fetchVoteSupport(proposal.id, address).catch(
            () => null
          ),
        }
      })
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
    setSubmissionError(null)
    setMessage('Preparing your batch vote…')
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
      setMessage('Confirm this batch in MetaMask…')
      const result = await raw.request({
        method: 'wallet_sendCalls',
        params: [buildWalletSendCalls(wallet.address, calls)],
      })
      const callsId = getCallsId(result)
      setMessage('Wallet confirmed. Waiting for Base confirmation…')
      let status: BatchCallStatus | null = null
      for (let i = 0; i < 60; i++) {
        const nextStatus = (await raw.request({
          method: 'wallet_getCallsStatus',
          params: [callsId],
        })) as BatchCallStatus
        status = nextStatus
        if (isCallsConfirmed(nextStatus.status)) break
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      if (!status || !isCallsConfirmed(status.status))
        throw new Error('Atomic batch did not succeed.')
      const receipts = status.receipts || []
      if (!verifyVoteCastLogs(receipts, wallet.address, selected, direction))
        throw new Error(
          'Receipt verification failed: VoteCast logs did not match the selected batch.'
        )
      for (const id of selected)
        if (!(await governor.hasVoted(BigInt(id), wallet.address)))
          throw new Error(`Postcondition failed for proposal ${id}.`)
      setMessage('Confirmed. Refreshing proposals…')
      window.location.reload()
    } catch (error) {
      setSubmissionError(
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
                onClick={() => {
                  setMessage('')
                  setSubmissionError(null)
                  setReviewOpen(true)
                }}
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
      <Modal
        isOpen={reviewOpen}
        setIsOpen={(isOpen) => {
          if (!busy) setReviewOpen(isOpen)
        }}
        size="small"
      >
        {busy ? (
          <BatchVoteProgress message={message} />
        ) : submissionError ? (
          <BatchVoteFailure
            message={submissionError}
            onCancel={() => {
              setSubmissionError(null)
              setReviewOpen(false)
            }}
            onRetry={submit}
          />
        ) : (
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
              <Button onClick={submit}>Continue to wallet</Button>
            </div>
          </div>
        )}
      </Modal>
      <div className="grid gap-5">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            now={now}
            proposal={proposal}
            tokenSymbol={tokenSymbol}
            selectable={proposal.state === 'Active'}
            selectionDisabled={votedProposals.has(proposal.id)}
            selected={selected.includes(proposal.id)}
            onToggle={() => toggle(proposal.id)}
            votedSupport={votedProposals.get(proposal.id)}
          />
        ))}
      </div>
    </>
  )
}

function BatchVoteFailure({
  message,
  onCancel,
  onRetry,
}: {
  message: string
  onCancel: () => void
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-brand-ui-primary">
          Batch vote was not confirmed
        </h2>
        <p className="text-sm leading-6 text-brand-ui-primary/70">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button
          className="rounded-full px-4 py-2 text-sm font-medium text-brand-ui-primary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    </div>
  )
}

function BatchVoteProgress({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <svg
        aria-hidden="true"
        className="h-8 w-8 animate-spin text-brand-ui-primary"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 018-8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-brand-ui-primary">
          Submitting batch vote
        </h2>
        <p
          aria-live="polite"
          className="text-sm text-brand-ui-primary/70"
          role="status"
        >
          {message}
        </p>
      </div>
    </div>
  )
}

function isCallsConfirmed(status: unknown) {
  if (status === 'CONFIRMED' || status === '0x1' || status === 1) return true
  const code = Number(status)
  return code >= 200 && code < 300
}

function getCallsId(result: unknown): string {
  if (typeof result === 'string') return result
  if (result && typeof result === 'object') {
    const id = (result as { id?: unknown }).id
    if (typeof id === 'string') return id
  }
  throw new Error('Wallet did not return a valid batch ID.')
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
