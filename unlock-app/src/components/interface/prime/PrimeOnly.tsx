import { Button, Card } from '@unlock-protocol/ui'
import { ReactNode } from 'react'
import { PRIME, useUnlockPrime } from '~/hooks/useUnlockPrime'
import { Paywall } from '@unlock-protocol/paywall'
import networks from '@unlock-protocol/networks'
import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'

export const PrimeOnly = ({ children }: { children: ReactNode }) => {
  const { isPrime } = useUnlockPrime()

  const join = () => {
    const paywall = new Paywall(networks)
    paywall.loadCheckoutModal({
      locks: {
        [PRIME]: {
          network: 8453,
        },
      },
    })
  }

  if (isPrime) {
    return <>{children}</>
  }

  return (
    <Card className="flex flex-col gap-4">
      <p>
        🪄 An Unlock Prime Membership is required to access this feature.{' '}
        <Link
          target="_blank"
          className="underline text-brand-ui-primary"
          href="https://unlock-protocol.com/prime"
        >
          Learn more{' '}
          <ExternalLinkIcon
            size={16}
            className="inline text-brand-ui-primary"
          />
        </Link>
      </p>
      <div className="flex justify-center">
        <Button onClick={join}>Become a Prime Member</Button>
      </div>
    </Card>
  )
}

export default PrimeOnly
