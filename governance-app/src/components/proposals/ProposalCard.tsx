import Link from 'next/link'
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
}

export function ProposalCard({
  now,
  proposal,
  tokenSymbol,
}: ProposalCardProps) {
  const quorumProgress = `${formatTokenAmount(
    proposal.forVotes + proposal.abstainVotes
  )} / ${formatTokenAmount(proposal.quorum)} ${tokenSymbol}`
  const deadlineLabel =
    proposal.state === 'Active'
      ? `Ends ${formatRelativeTime(proposal.voteEndTimestamp, now)}`
      : `Ended ${formatDateTime(proposal.voteEndTimestamp)}`

  return (
    <Link
      className="block rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm transition hover:border-brand-ui-primary/25"
      href={`/proposals/${proposal.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <ProposalStateBadge state={proposal.state} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
              Proposal {proposal.id}
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-brand-ui-primary">
            {proposal.title}
          </h2>
          <p className="text-sm text-brand-ui-primary/65">
            Proposed by {truncateAddress(proposal.proposer)}. {deadlineLabel}
          </p>
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
    </Link>
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
