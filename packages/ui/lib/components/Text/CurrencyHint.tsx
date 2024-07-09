import { Link } from '../Link/Link'

interface CurrencyHintProps {
  network: string
}

export const CurrencyHint = ({ network }: CurrencyHintProps) => {
  return (
    <span className="text-sm text-gray-600">
      You can select any ERC20 currency deployed on {network}.{' '}
      <Link
        href="https://unlock-protocol.com/guides/using-a-custom-currency/"
        className="underline"
      >
        Learn more
      </Link>
    </span>
  )
}
