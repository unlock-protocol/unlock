import { Card } from '@unlock-protocol/ui'
import Link from 'next/link'

export const HasTicket = () => {
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
