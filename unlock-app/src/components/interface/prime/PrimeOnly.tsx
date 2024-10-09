import { Button, Card } from '@unlock-protocol/ui'
import { ReactNode } from 'react'
import { useUnlockPrime, useUnlockPrimeEvent } from '~/hooks/useUnlockPrime'
import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { PaywallConfigType } from '@unlock-protocol/core'

// Small Prime card
export const SmallPrimeCard = () => {
  const { joinPrime } = useUnlockPrime()

  return (
    <div className="flex flex-col items-center gap-2 bg-white rounded-md w-3/4 p-4 shadow-md text-sm	">
      <p>
        Unlock Prime members only.{' '}
        <Link
          target="_blank"
          className="underline text-brand-ui-primary"
          href="/prime"
        >
          Learn more
        </Link>
      </p>
      <div>
        <Button
          onClick={() => {
            joinPrime()
            return false
          }}
          size="small"
        >
          Join now!
        </Button>
      </div>
    </div>
  )
}

// Prime Card
export const PrimeCard = () => {
  const { joinPrime } = useUnlockPrime()

  return (
    <Card className="flex flex-col gap-4" shadow="lg">
      <p>
        🪄 An Unlock Prime Membership is required to access this feature.{' '}
        <Link
          target="_blank"
          className="underline text-brand-ui-primary"
          href="/prime"
        >
          Learn more{' '}
          <ExternalLinkIcon
            size={16}
            className="inline text-brand-ui-primary"
          />
        </Link>
      </p>
      <div className="flex justify-center">
        <Button onClick={joinPrime}>Become a Prime Member</Button>
      </div>
    </Card>
  )
}

export const PrimeOnly = ({ children }: { children: ReactNode }) => {
  const { isPrime } = useUnlockPrime()

  if (isPrime) {
    return <>{children}</>
  }

  return <PrimeCard />
}

export const PrimeEventOnly = ({
  children,
  checkoutConfig,
}: {
  children: ReactNode
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}) => {
  const { isPrime } = useUnlockPrimeEvent({
    checkoutConfig,
  })
  if (isPrime) {
    return <>{children}</>
  }

  return <PrimeCard />
}

export default PrimeOnly
