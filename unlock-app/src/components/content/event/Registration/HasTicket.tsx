import { Card } from '@unlock-protocol/ui'
import Link from 'next/link'

export const HasTicket = () => {
  return (
    <Card className="grid gap-6 mt-10 lg:mt-0">
      <div className="grid gap-6 md:gap-8">
        <p className="text-lg">
          🎉 You already have a ticket! You can view it in{' '}
          <Link className="underline" href="/keychain">
            your keychain
          </Link>
          .
        </p>
      </div>
    </Card>
  )
}
