import { ProposalComposer } from '~/components/proposals/ProposalComposer'
import { getTokenSymbol } from '~/lib/governance/rpc'

export default async function ProposePage() {
  const tokenSymbol = await getTokenSymbol().catch(() => 'UP')
  return <ProposalComposer tokenSymbol={tokenSymbol} />
}
