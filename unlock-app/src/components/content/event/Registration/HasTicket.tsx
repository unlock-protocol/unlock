import { PaywallConfigType } from '@unlock-protocol/core'
import { Card } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export interface HasTicketProps {
  hasRefreshed: boolean
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const HasTicket = ({ hasRefreshed, checkoutConfig }: HasTicketProps) => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirectUri =
      checkoutConfig.config.redirectUri || searchParams.get('redirectUri')
    if (redirectUri && hasRefreshed) {
      window.location.href = redirectUri
    }
  }, [checkoutConfig, hasRefreshed, searchParams])

  return (
    <Card className="grid gap-4 mt-10 lg:mt-0">
      <p className="text-lg">
        🎉 You already have a ticket! You can view it in{' '}
        <Link className="underline" href="/keychain">
          your keychain
        </Link>
        .
      </p>
    </Card>
  )
}
