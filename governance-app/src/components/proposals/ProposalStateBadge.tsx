import type { ProposalState } from '~/lib/governance/types'

const stateClassNames: Record<ProposalState, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Canceled: 'bg-slate-200 text-slate-700',
  Defeated: 'bg-rose-100 text-rose-700',
  Executed: 'bg-sky-100 text-sky-700',
  Pending: 'bg-amber-100 text-amber-700',
  Queued: 'bg-violet-100 text-violet-700',
  Succeeded: 'bg-teal-100 text-teal-700',
}

type ProposalStateBadgeProps = {
  state: ProposalState
}

export function ProposalStateBadge({ state }: ProposalStateBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stateClassNames[state]}`}
    >
      {state}
    </span>
  )
}
