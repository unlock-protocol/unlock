import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AddressLink } from '~/components/AddressLink'
import { TruncatedId } from '~/components/TruncatedId'
import { ProposalStateBadge } from '~/components/proposals/ProposalStateBadge'
import { ProposalErrorState } from '~/components/proposals/ProposalErrorState'
import { ProposalWritePanel } from '~/components/proposals/ProposalWritePanel'
import {
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  formatTokenAmount,
  percentage,
} from '~/lib/governance/format'
import {
  decodeProposalCalldatas,
  getGovernanceOverview,
  getProposalById,
} from '~/lib/governance/proposals'
import { isExecutable } from '~/lib/governance/state'
import { addressExplorerUrl, txExplorerUrl } from '~/config/governance'

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
      // 3-item DOM order: [header] → [aside] → [main]
      // Mobile stacks in that order: title → cast vote → breakdown/calls
      // Desktop: 2-col grid — header (col1 row1), aside (col2 row1-2), main (col1 row2)
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
        {/* Col 1, Row 1 — proposal header */}
        <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ProposalStateBadge state={proposal.state} />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/45">
                  Proposal{' '}
                  <TruncatedId
                    id={proposal.id}
                    keep={4}
                    label="Copy full proposal ID"
                  />
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-brand-ui-primary sm:text-4xl">
                {proposal.title}
              </h2>
              <div className="prose prose-sm break-words text-brand-ui-primary/72">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Proposal descriptions are user-controlled (on-chain).
                    // Allow https:// external links and #anchor links.
                    // http:, data:, javascript: and other schemes are blocked
                    // (rendered as plain text — no indication shown since the
                    // text content is preserved and the intent is still clear).
                    a: ({ href, children }) => {
                      const isExternal = href?.startsWith('https://')
                      const isAnchor = href?.startsWith('#')
                      if (isExternal) {
                        return (
                          <a
                            href={href}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {children}
                          </a>
                        )
                      }
                      if (isAnchor) {
                        // Same-page anchor — no target="_blank" (would open a
                        // new tab without the fragment resolving correctly).
                        return <a href={href}>{children}</a>
                      }
                      return <span>{children}</span>
                    },
                    // Strip all images — proposal content is user-controlled
                    // on-chain data; any https:// image is a potential tracking
                    // pixel or fingerprinting beacon shown to every visitor.
                    img: ({ alt }) => <span>{alt}</span>,
                  }}
                >
                  {/* Strip the first line (the title) — it's already shown in
                      the <h2> above. Handles \n, \r\n, and single-line bodies. */}
                  {proposal.description.replace(/^[^\r\n]*[\r\n]*/, '')}
                </ReactMarkdown>
              </div>
            </div>
            <div className="rounded-3xl bg-ui-secondary-200 px-4 py-3 text-sm text-brand-ui-primary/70">
              Proposed by{' '}
              <AddressLink
                address={proposal.proposer}
                externalLinkUrl={
                  addressExplorerUrl(proposal.proposer) ?? undefined
                }
                showExternalLink
              />
            </div>
          </div>
        </section>

        {/* Col 2, Rows 1–2 — actions sidebar (shown after title on mobile) */}
        <aside className="space-y-6 lg:row-span-2">
          <ProposalWritePanel
            calldatas={proposal.calldatas}
            descriptionHash={proposal.descriptionHash}
            etaSeconds={proposal.etaSeconds?.toString() || null}
            proposalId={proposal.id}
            state={proposal.state}
            targets={proposal.targets}
            tokenSymbol={overview.tokenSymbol}
            values={proposal.values.map((value) => value.toString())}
          />

          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-brand-ui-primary">
              Lifecycle
            </h3>
            <div className="mt-4 space-y-3">
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
              {proposal.etaSeconds ? (
                <TimelineRow
                  label="Queued / ETA"
                  value={`${formatDateTime(proposal.etaSeconds)} (${executeLabel})`}
                />
              ) : proposal.state === 'Succeeded' ? (
                <TimelineRow
                  label="Queued / ETA"
                  value="Not yet queued — queue this proposal to start the timelock."
                />
              ) : null}
              {proposal.executedAt ? (
                <TimelineRow
                  label="Executed"
                  value={formatDateTime(proposal.executedAt)}
                />
              ) : null}
              {proposal.canceledAt ? (
                <TimelineRow
                  label="Canceled"
                  value={formatDateTime(proposal.canceledAt)}
                />
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-5 shadow-sm sm:p-6">
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
                value={formatDuration(overview.votingDelay)}
              />
              <DetailRow
                label="Voting period"
                value={formatDuration(overview.votingPeriod)}
              />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
                  Transaction
                </dt>
                <dd className="mt-1 font-medium text-brand-ui-primary">
                  {txExplorerUrl(proposal.transactionHash) ? (
                    <a
                      className="underline hover:text-brand-ui-primary/70"
                      href={txExplorerUrl(proposal.transactionHash)!}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Proposal submission transaction
                    </a>
                  ) : (
                    <span>Proposal submission transaction</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </aside>

        {/* Col 1, Row 2 — vote breakdown + proposed calls */}
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="text-xl font-semibold text-brand-ui-primary sm:text-2xl">
              Vote breakdown
            </h3>
            <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
              <VotePanel
                label="For"
                percentageLabel={percentage(proposal.forVotes, totalVotes)}
                value={proposal.forVotes}
              />
              <VotePanel
                label="Against"
                percentageLabel={percentage(proposal.againstVotes, totalVotes)}
                value={proposal.againstVotes}
              />
              <VotePanel
                label="Abstain"
                percentageLabel={percentage(proposal.abstainVotes, totalVotes)}
                value={proposal.abstainVotes}
              />
            </div>
            <QuorumPanel
              quorum={proposal.quorum}
              quorumVotes={quorumVotes}
              tokenSymbol={overview.tokenSymbol}
            />
          </section>

          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="text-xl font-semibold text-brand-ui-primary sm:text-2xl">
              Proposed calls
            </h3>
            <div className="mt-5 space-y-4">
              {decodedCalls.map((call, index) => (
                <div
                  key={`${proposal.id}-${index}`}
                  className="rounded-3xl bg-ui-secondary-200 p-4 sm:p-5"
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
                      <div className="text-base font-semibold text-brand-ui-primary sm:text-lg">
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
                      <div className="break-all">{call.target}</div>
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
      </div>
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

function QuorumPanel({
  quorum,
  quorumVotes,
  tokenSymbol,
}: {
  quorum: bigint
  quorumVotes: bigint
  tokenSymbol: string
}) {
  const reached = quorum === 0n || quorumVotes >= quorum
  const progressPct =
    quorum === 0n
      ? 100
      : Math.min(100, Number((quorumVotes * 10000n) / quorum) / 100)

  return (
    <div className="mt-5 rounded-3xl bg-ui-secondary-200 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
          Quorum
        </div>
        {reached && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Reached
          </span>
        )}
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-ui-primary/10">
        <div
          className={`h-full rounded-full transition-all ${reached ? 'bg-emerald-500' : 'bg-brand-ui-primary/40'}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-brand-ui-primary/65">
        {reached ? (
          <>
            {formatTokenAmount(quorumVotes)} {tokenSymbol} voted (quorum:{' '}
            {formatTokenAmount(quorum)})
          </>
        ) : (
          <>
            {formatTokenAmount(quorumVotes)} / {formatTokenAmount(quorum)}{' '}
            {tokenSymbol} — {formatTokenAmount(quorum - quorumVotes)} more
            needed
          </>
        )}
      </div>
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
