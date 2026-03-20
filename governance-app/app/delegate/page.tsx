import { DelegateAccountPanel } from '~/components/delegate/DelegateAccountPanel'
import { getTokenSymbol } from '~/lib/governance/rpc'

export default async function DelegatePage() {
  const tokenSymbol = await getTokenSymbol()
  return <DelegateAccountPanel tokenSymbol={tokenSymbol} />
}
