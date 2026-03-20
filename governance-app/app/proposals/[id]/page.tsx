import { notFound } from 'next/navigation'
import { ProposalStateBadge } from '~/components/proposals/ProposalStateBadge'
import { ProposalErrorState } from '~/components/proposals/ProposalErrorState'
import {
  formatDateTime,
  formatRelativeTime,
  formatTokenAmount,
  percentage,
  truncateAddress,
} from '~/lib/governance/format'
import {
  decodeProposalCalldatas,
  getGovernanceOverview,
  getProposalById,
} from '~/lib/governance/proposals'
import { isExecutable } from '~/lib/governance/state'

export const dynamic = 'force-dynamic'

type ProposalPageProps = {
  params: {
    id: string
  }
}

export default async function ProposalDetailPage({
  params,
}: ProposalPageProps) {
  try {
    const [overview, proposal] = await Promise.all([
      getGovernanceOverview(),
      getProposalById(params.id),
    ])

    if (!proposal) {
      notFound()
    }

    const decodedCalls = decodeProposalCalldatas(proposal)
    const totalVotes =
      proposal.forVotes + proposal.againstVotes + proposal.abstainVotes
    const quorumVotes = proposal.forVotes + proposal.abstainVotes
    const executeLabel = proposal.etaSeconds
      ? isExecutable(proposal, overview.latestTimestamp)
        ? 'Executable now'
        : `Executable ${formatRelativeTime(
            proposal.etaSeconds,
            overview.latestTimestamp
          )}`
      : 'Not queued'

    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <ProposalStateBadge state={proposal.state} />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/45">
                  Proposal {proposal.id}
                </span>
              </div>
              <h2 className="text-4xl font-semibold text-brand-ui-primary">
                {proposal.title}
              </h2>
              <p className="max-w-3xl whitespace-pre-wrap text-base leading-7 text-brand-ui-primary/72">
                {proposal.description}
              </p>
            </div>
            <div className="rounded-3xl bg-ui-secondary-200 px-5 py-4 text-sm text-brand-ui-primary/70">
              Proposed by {truncateAddress(proposal.proposer)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-brand-ui-primary">
                  Vote breakdown
                </h3>
                <div className="text-sm text-brand-ui-primary/60">
                  Quorum counts {overview.tokenSymbol} votes for + abstain
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <VotePanel
                  label="For"
                  percentageLabel={percentage(proposal.forVotes, totalVotes)}
                  value={proposal.forVotes}
                />
                <VotePanel
                  label="Against"
                  percentageLabel={percentage(
                    proposal.againstVotes,
                    totalVotes
                  )}
                  value={proposal.againstVotes}
                />
                <VotePanel
                  label="Abstain"
                  percentageLabel={percentage(
                    proposal.abstainVotes,
                    totalVotes
                  )}
                  value={proposal.abstainVotes}
                />
              </div>
              <div className="mt-6 rounded-3xl bg-ui-secondary-200 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                  Quorum progress
                </div>
                <div className="mt-2 text-lg font-semibold text-brand-ui-primary">
                  {formatTokenAmount(quorumVotes)} /{' '}
                  {formatTokenAmount(proposal.quorum)} {overview.tokenSymbol}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-brand-ui-primary">
                Lifecycle
              </h3>
              <div className="mt-6 space-y-4">
                <TimelineRow
                  label="Submitted"
                  value={formatDateTime(proposal.createdAtTimestamp)}
                />
                <TimelineRow
                  label="Voting opens"
                  value={`${formatDateTime(proposal.voteStartTimestamp)} (${formatRelativeTime(
                    proposal.voteStartTimestamp,
                    overview.latestTimestamp
                  )})`}
                />
                <TimelineRow
                  label="Voting closes"
                  value={formatDateTime(proposal.voteEndTimestamp)}
                />
                <TimelineRow
                  label="Queued / ETA"
                  value={
                    proposal.etaSeconds
                      ? `${formatDateTime(proposal.etaSeconds)} (${executeLabel})`
                      : 'Not queued'
                  }
                />
                <TimelineRow
                  label="Executed"
                  value={formatDateTime(proposal.executedAt)}
                />
                <TimelineRow
                  label="Canceled"
                  value={formatDateTime(proposal.canceledAt)}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-brand-ui-primary">
                Proposed calls
              </h3>
              <div className="mt-6 space-y-4">
                {decodedCalls.map((call, index) => (
                  <div
                    key={`${proposal.id}-${index}`}
                    className="rounded-3xl bg-ui-secondary-200 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                        Call {index + 1}
                      </div>
                      <div className="text-sm text-brand-ui-primary/65">
                        Value: {formatTokenAmount(call.value)} ETH
                      </div>
                    </div>
                    {call.kind === 'decoded' ? (
                      <div className="mt-3 space-y-2">
                        <div className="text-lg font-semibold text-brand-ui-primary">
                          {call.contractLabel}.{call.functionName}()
                        </div>
                        <div className="text-sm text-brand-ui-primary/70">
                          {call.args.length
                            ? call.args.join(', ')
                            : 'No arguments'}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2 text-sm text-brand-ui-primary/70">
                        <div>Target: {call.target}</div>
                        <div className="break-all font-mono text-xs">
                          {call.calldata}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
                Governance settings
              </h3>
              <dl className="mt-4 space-y-4 text-sm text-brand-ui-primary/72">
                <DetailRow
                  label="Proposal threshold"
                  value={`${formatTokenAmount(proposal.proposalThreshold)} ${overview.tokenSymbol}`}
                />
                <DetailRow
                  label="Voting delay"
                  value={`${overview.votingDelay.toString()} seconds`}
                />
                <DetailRow
                  label="Voting period"
                  value={`${overview.votingPeriod.toString()} seconds`}
                />
                <DetailRow
                  label="Transaction"
                  value={truncateAddress(proposal.transactionHash, 8)}
                />
              </dl>
            </section>

            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
                Lifecycle action
              </h3>
              <div className="mt-4 rounded-3xl bg-ui-secondary-200 p-5">
                <div className="text-lg font-semibold text-brand-ui-primary">
                  {proposal.state === 'Succeeded'
                    ? 'Queue proposal'
                    : proposal.state === 'Queued'
                      ? 'Execute proposal'
                      : 'No action available'}
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                  Write flows land in a later slice. This page already derives
                  the live action state, including queued execution readiness.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    )
  } catch (error) {
    console.error('[proposals/[id]/page] governance data load failed:', error)
    return (
      <ProposalErrorState description="This proposal could not load governance data from the subgraph. Ensure BASE_SUBGRAPH_URL is set and the subgraph is reachable." />
    )
  }
}

function VotePanel({
  label,
  percentageLabel,
  value,
}: {
  label: string
  percentageLabel: string
  value: bigint
}) {
  return (
    <div className="rounded-3xl bg-ui-secondary-200 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
        {formatTokenAmount(value)}
      </div>
      <div className="text-sm text-brand-ui-primary/65">{percentageLabel}</div>
    </div>
  )
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-ui-secondary-200 px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        {label}
      </div>
      <div className="mt-1 text-sm text-brand-ui-primary/75">{value}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-brand-ui-primary">{value}</dd>
    </div>
  )
}
