'use client'
import Link from 'next/link'
import { TruncatedId } from '~/components/TruncatedId'
import {
  formatDateTime,
  formatRelativeTime,
  formatTokenAmount,
  truncateAddress,
} from '~/lib/governance/format'
import type { ProposalRecord } from '~/lib/governance/types'
import { ProposalStateBadge } from './ProposalStateBadge'

type ProposalCardProps = {
  now: bigint
  proposal: ProposalRecord
  tokenSymbol: string
  selectable?: boolean
  selected?: boolean
  onToggle?: () => void
  selectionDisabled?: boolean
  votedSupport?: number | null
}

export function ProposalCard({
  now,
  proposal,
  tokenSymbol,
  selectable = false,
  selected = false,
  onToggle,
  selectionDisabled = false,
  votedSupport,
}: ProposalCardProps) {
  const isUnavailableForBatchVoting = selectable && selectionDisabled
  const quorumProgress = `${formatTokenAmount(
    proposal.forVotes + proposal.abstainVotes
  )} / ${formatTokenAmount(proposal.quorum)} ${tokenSymbol}`
  const deadlineLabel =
    proposal.state === 'Active'
      ? `Ends ${formatRelativeTime(proposal.voteEndTimestamp, now)}`
      : `Ended ${formatDateTime(proposal.voteEndTimestamp)}`

  return (
    <article
      className={`rounded-[2rem] border bg-white p-6 shadow-sm transition ${selected ? 'border-brand-ui-primary ring-2 ring-brand-ui-primary/15' : 'border-brand-ui-primary/10'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          {selectable && (
            <label
              className={`pt-1 ${isUnavailableForBatchVoting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={
                isUnavailableForBatchVoting
                  ? 'Already voted — unavailable for batch voting'
                  : undefined
              }
            >
              <span className="sr-only">
                {isUnavailableForBatchVoting
                  ? `Proposal ${proposal.id} is unavailable for batch voting because you already voted.`
                  : `Select proposal ${proposal.id}`}
              </span>
              <input
                type="checkbox"
                checked={selected}
                disabled={selectionDisabled}
                onChange={onToggle}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ui-primary/30 ${isUnavailableForBatchVoting ? 'border-slate-300 bg-slate-100 text-slate-500' : selected ? 'border-brand-ui-primary bg-brand-ui-primary text-white' : 'border-brand-ui-primary/30 bg-white text-transparent'}`}
              >
                {isUnavailableForBatchVoting ? <LockedSelectionIcon /> : '✓'}
              </span>
            </label>
          )}
          <Link href={`/proposals/${proposal.id}`} className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <ProposalStateBadge state={proposal.state} />
              {votedSupport !== undefined && (
                <VotedBadge support={votedSupport} />
              )}
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                Proposal{' '}
                <TruncatedId
                  id={proposal.id}
                  keep={4}
                  label="Copy full proposal ID"
                />
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-brand-ui-primary">
              {proposal.title}
            </h2>
            <p className="text-sm text-brand-ui-primary/65">
              Proposed by {truncateAddress(proposal.proposer)}. {deadlineLabel}
            </p>
          </Link>
        </div>
        <div className="rounded-3xl bg-ui-secondary-200 px-4 py-3 text-sm text-brand-ui-primary/75">
          Created {formatDateTime(proposal.createdAtTimestamp)}
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <VoteMetric
          label="For"
          tokenSymbol={tokenSymbol}
          value={proposal.forVotes}
        />
        <VoteMetric
          label="Against"
          tokenSymbol={tokenSymbol}
          value={proposal.againstVotes}
        />
        <VoteMetric
          label="Abstain"
          tokenSymbol={tokenSymbol}
          value={proposal.abstainVotes}
        />
        <div className="rounded-3xl bg-ui-secondary-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
            Quorum
          </div>
          <div className="mt-2 text-sm font-medium text-brand-ui-primary">
            {quorumProgress}
          </div>
        </div>
      </div>
    </article>
  )
}

function LockedSelectionIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="10" rx="2" width="14" x="5" y="11" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function VotedBadge({ support }: { support: number | null }) {
  const vote =
    support === 1
      ? {
          label: 'You voted For',
          className: 'border-emerald-300 bg-emerald-100 text-emerald-900',
        }
      : support === 0
        ? {
            label: 'You voted Against',
            className: 'border-red-300 bg-red-100 text-red-900',
          }
        : support === 2
          ? {
              label: 'You voted Abstain',
              className: 'border-sky-300 bg-sky-100 text-sky-900',
            }
          : {
              label: 'You voted',
              className:
                'border-brand-ui-primary/25 bg-brand-ui-primary/10 text-brand-ui-primary',
            }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${vote.className}`}
    >
      {vote.label}
    </span>
  )
}

function VoteMetric({
  label,
  tokenSymbol,
  value,
}: {
  label: string
  tokenSymbol: string
  value: bigint
}) {
  return (
    <div className="rounded-3xl bg-ui-secondary-200 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-brand-ui-primary">
        {formatTokenAmount(value)}
      </div>
      <div className="text-sm text-brand-ui-primary/65">{tokenSymbol}</div>
    </div>
  )
}
