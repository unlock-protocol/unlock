import { PaywallConfigType } from '@unlock-protocol/core'
import { Card } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export interface HasTicketProps {
  hasRefreshed: boolean
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const HasTicket = ({ hasRefreshed, checkoutConfig }: HasTicketProps) => {
  const router = useRouter()

  useEffect(() => {
    if (checkoutConfig.config.redirectUri && hasRefreshed) {
      router.push(checkoutConfig.config.redirectUri)
    }
  }, [checkoutConfig, hasRefreshed, router])

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
