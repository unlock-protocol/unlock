import { RoutePlaceholder } from '~/components/layout/RoutePlaceholder'

type ProposalPageProps = {
  params: {
    id: string
  }
}

export default function ProposalDetailPage({ params }: ProposalPageProps) {
  return (
    <RoutePlaceholder
      title={`Proposal ${params.id}`}
      description="Proposal detail shell with space reserved for timeline, vote breakdown, decoded calldata, and lifecycle actions."
    />
  )
}
