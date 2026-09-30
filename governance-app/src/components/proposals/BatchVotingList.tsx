'use client'

import { Contract, BrowserProvider } from 'ethers'
import { useEffect, useState } from 'react'
import { UPGovernor } from '@unlock-protocol/contracts'
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

  useEffect(() => {
    setSelected([])
    setDirection(null)
  }, [wallet.address])

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
            return 'The proposal snapshot is not available yet.'
          }
          const [hasVoted, votingPower] = await Promise.all([
            governor.hasVoted(BigInt(id), wallet.address),
            governor.getVotes(wallet.address, proposal.voteStartTimestamp),
          ])
          return canSelectProposal({
            state: proposal.state,
            hasVoted,
            votingPower,
          })
        })
      )
      if (checks.some(Boolean)) {
        setSelected([])
        setDirection(null)
        throw new Error(
          'One or more selected proposals can no longer be voted on.'
        )
      }
      if (
        !window.confirm(
          `Submit ${selected.length} ${direction} vote${selected.length === 1 ? '' : 's'} atomically on Base?`
        )
      )
        return
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
      setMessage(
        `Verified atomic ${direction} batch: ${selected.length} proposals voted on successfully.`
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
                onClick={submit}
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
      <div className="grid gap-5">
        {proposals.map((proposal) => {
          return (
            <ProposalCard
              key={proposal.id}
              now={now}
              proposal={proposal}
              tokenSymbol={tokenSymbol}
              selectable={proposal.state === 'Active'}
              selected={selected.includes(proposal.id)}
              onToggle={() => toggle(proposal.id)}
            />
          )
        })}
      </div>
    </>
  )
}
