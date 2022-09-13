import { useConfig } from '~/utils/withConfig'

interface LinkProps {
  label: string
  link: string
  ref: string
}

const CALL_TO_ACTION_MAPPING: Record<number | 'default', LinkProps> = {
  1: {
    label: 'Purchase some Ether using ',
    link: 'https://www.coinbase.com/',
    ref: 'Coinbase',
  },
  100: {
    label: 'Transfer some Ethereum&apos;s DAI to the xDAI chain using ',
    link: 'https://omni.xdaichain.com/bridge',
    ref: 'the Omnibridge.',
  },
  137: {
    label: 'Transfer some Matic to the Polygon chain using ',
    link: 'https://wallet.matic.network/bridge',
    ref: 'the Bridge.',
  },
  default: {
    label: '',
    link: '',
    ref: '',
  },
}

export const WarningBar = ({ children }: any) => {
  return (
    <div className="p-2 text-red-700 bg-red-100 border-2 border-red-500 rounded-xl">
      {children}
    </div>
  )
}
const CallToAction = ({ network }: { network: number }) => {
  const config = useConfig()
  const info = CALL_TO_ACTION_MAPPING[network] || CALL_TO_ACTION_MAPPING.default

  if (!info) return null

  const currency = config.networks[network!].baseCurrencySymbol
  const networkName = config.networks[network!].name
  return (
    <WarningBar>
      <>
        {' '}
        <span>
          {` You currently do not have any ${currency} token to pay for gas to deploy
  on the ${networkName} network.`}
        </span>
        <>
          <span>{` ${info?.label}`}</span>
          <a
            className="underline"
            href={info.link}
            target="_blank"
            rel="noreferrer"
          >
            {info.ref}
          </a>
        </>
      </>
    </WarningBar>
  )
}
export const BalanceWarning = ({
  network,
  balance = 0,
}: {
  network: number
  balance: number
}) => {
  if (balance !== 0) {
    return null
  }

  if (!network) return null

  return <CallToAction network={network} />
}
