'use client'

import { Contract, BrowserProvider } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
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
  const [preflight, setPreflight] = useState<
    Record<
      string,
      { hasVoted: boolean; votingPower: bigint; reason: string | null }
    >
  >({})
  const [capability, setCapability] = useState<
    'ready' | 'unsupported' | 'unknown'
  >('unknown')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [preflightWallet, setPreflightWallet] = useState<string | null>(null)

  const activeProposals = useMemo(
    () => proposals.filter((p) => p.state === 'Active'),
    [proposals]
  )

  useEffect(() => {
    setSelected([])
    setDirection(null)
    setPreflight({})
    setPreflightWallet(null)
  }, [wallet.address])

  async function runPreflight() {
    setMessage('Reading Base wallet capabilities and proposal state…')
    setBusy(true)
    try {
      if (!wallet.address || !wallet.selectedWallet)
        throw new Error(
          'Connect and explicitly choose an external wallet first.'
        )
      const raw = await wallet.getProvider()
      const caps = await raw.request({
        method: 'wallet_getCapabilities',
        params: [wallet.address],
      })
      const atomic = supportsAtomic(caps)
      setCapability(atomic ? 'ready' : 'unsupported')
      if (!atomic)
        throw new Error(
          'This wallet does not support atomic batch calls on Base.'
        )
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
      if (!String(clockMode).toLowerCase().includes('timestamp')) {
        throw new Error(`Unsupported governor clock mode: ${clockMode}`)
      }
      const results: typeof preflight = {}
      for (const proposal of activeProposals) {
        if (proposal.voteStartTimestamp > BigInt(currentClock)) {
          results[proposal.id] = {
            hasVoted: false,
            votingPower: 0n,
            reason:
              'The proposal snapshot is ahead of the current governor clock.',
          }
          continue
        }
        const [hasVoted, votingPower] = await Promise.all([
          governor.hasVoted(BigInt(proposal.id), wallet.address),
          governor.getVotes(wallet.address, proposal.voteStartTimestamp),
        ])
        results[proposal.id] = {
          hasVoted,
          votingPower,
          reason: canSelectProposal({
            state: proposal.state,
            hasVoted,
            votingPower,
          }),
        }
      }
      setPreflight(results)
      setPreflightWallet(wallet.address)
      setSelected((current) =>
        current.filter((id) => !results[id]?.reason).slice(0, MAX_BATCH_VOTES)
      )
      setMessage(
        'Preflight complete. Select eligible proposals, choose a direction, then review the batch.'
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Preflight failed.')
    } finally {
      setBusy(false)
    }
  }

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
    if (
      !wallet.address ||
      !wallet.selectedWallet ||
      !direction ||
      !selected.length
    )
      return
    if (preflightWallet !== wallet.address) {
      setSelected([])
      setDirection(null)
      setMessage('Wallet changed; run preflight again before submitting.')
      return
    }
    if (
      !window.confirm(
        `Submit ${direction} votes for ${selected.length} proposals atomically on Base?`
      )
    )
      return
    setBusy(true)
    setMessage('Re-checking eligibility before opening the wallet…')
    try {
      const raw = await wallet.getProvider()
      const provider = new BrowserProvider(raw, 'any')
      const governor = new Contract(
        governanceConfig.governorAddress,
        getContractAbi(UPGovernor),
        provider
      )
      const clockMode = await governor.CLOCK_MODE()
      if (!String(clockMode).toLowerCase().includes('timestamp'))
        throw new Error(`Unsupported governor clock mode: ${clockMode}`)
      const checks = await Promise.all(
        selected.map(async (id) => {
          const proposal = proposals.find((item) => item.id === id)!
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
          'A selected proposal is no longer eligible; selection was cleared.'
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
                disabled={busy || selected.some((id) => preflight[id]?.reason)}
                onClick={submit}
                className="rounded-full bg-brand-ui-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Review & submit {direction} votes
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-brand-ui-primary/60">
            Base atomic execution · {MAX_BATCH_VOTES}-proposal maximum · no
            direction is preselected
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProposalFilters activeFilter={activeFilter} />
        <button
          onClick={runPreflight}
          disabled={busy || !wallet.isReady}
          className="rounded-full border border-brand-ui-primary/15 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          {busy ? 'Checking…' : 'Check batch voting eligibility'}
        </button>
      </div>
      {wallet.wallets.length > 1 && (
        <label className="block text-sm">
          External wallet
          <select
            className="ml-2 rounded-lg border p-2"
            value={wallet.address || ''}
            onChange={(event) => wallet.selectWallet(event.target.value)}
          >
            <option value="">Choose a wallet</option>
            {wallet.wallets.map((item) => (
              <option key={item.address} value={item.address}>
                {item.address}
              </option>
            ))}
          </select>
        </label>
      )}
      {message && (
        <p className="rounded-xl bg-white p-4 text-sm" role="status">
          {message}
        </p>
      )}
      <div className="grid gap-5">
        {proposals.map((proposal) => {
          const check = preflight[proposal.id]
          const reason =
            proposal.state !== 'Active'
              ? 'Only Active proposals are eligible.'
              : check?.reason ||
                (capability === 'unsupported'
                  ? 'Atomic Base execution is unavailable.'
                  : "Run preflight to confirm this wallet's snapshot voting power.")
          return (
            <ProposalCard
              key={proposal.id}
              now={now}
              proposal={proposal}
              tokenSymbol={tokenSymbol}
              selectable={proposal.state === 'Active'}
              selectionDisabled={!check || Boolean(check.reason)}
              selected={selected.includes(proposal.id)}
              onToggle={() => toggle(proposal.id)}
              unavailableReason={reason}
            />
          )
        })}
      </div>
    </>
  )
}
