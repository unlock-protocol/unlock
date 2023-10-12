import React from 'react'
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
  5: {
    label: 'Get some test ETH from ',
    link: 'https://goerlifaucet.com/',
    ref: 'the faucet.',
  },
  10: {
    label: 'Transfer some ETH from ',
    link: 'https://app.optimism.io/bridge/deposit',
    ref: 'the Optimism Bridge.',
  },
  42161: {
    label: 'Tranfer some ETH from ',
    link: 'https://bridge.arbitrum.io/',
    ref: 'the Arbitrum Bridge.',
  },
  100: {
    label: 'Transfer some Ethereum&apos;s DAI to the Gnosis Chain chain using ',
    link: 'https://omni.xdaichain.com/bridge',
    ref: 'the Omnibridge.',
  },
  137: {
    label: 'Transfer some Matic to the Polygon chain using ',
    link: 'https://wallet.polygon.technology/',
    ref: 'the Bridge.',
  },
  default: {
    label: '',
    link: '',
    ref: '',
  },
}

export const WarningBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-base text-red-700 bg-red-100 border border-red-700 rounded-xl">
      {children}
    </div>
  )
}
const CallToAction = ({ network }: { network: number }) => {
  const config = useConfig()
  const info = CALL_TO_ACTION_MAPPING[network] || CALL_TO_ACTION_MAPPING.default

  if (!info) return null

  const currency = config.networks[network!].nativeCurrency.symbol
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
