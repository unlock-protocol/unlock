import networks from '@unlock-protocol/networks'
import Link from 'next/link'
import { useProtocolFee } from '~/hooks/useProtocolFee'

export const ProtocolFee = ({ network }: { network: number }) => {
  const { name } = networks[network]
  const { data: protocolFee } = useProtocolFee(network)
  if (protocolFee) {
    return (
      <p>
        There is currently a {protocolFee}%{' '}
        <Link
          className="underline"
          target="_blank"
          href={
            'https://docs.unlock-protocol.com/governance/unlock-dao-tokens/#protocol-fee'
          }
        >
          Unlock Protocol fee
        </Link>{' '}
        on {name}.{' '}
      </p>
    )
  }
  return null
}
