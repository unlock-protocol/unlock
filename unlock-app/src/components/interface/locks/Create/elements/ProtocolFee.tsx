import networks from '@unlock-protocol/networks'
import Link from 'next/link'
import { useProtocolFee } from '~/hooks/useProtocolFee'

const formHelpTextClassName = 'px-1 text-sm leading-6 text-gray-700'

export const ProtocolFee = ({ network }: { network: number }) => {
  const { name } = networks[network]
  const { data: protocolFee } = useProtocolFee(network)
  if (protocolFee) {
    return (
      <p className={formHelpTextClassName}>
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
