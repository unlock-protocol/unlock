import Link from 'next/link'

export const HasTicket = () => {
  return (
    <p className="text-lg">
      🎉 You already have a ticket! You can view it in{' '}
      <Link className="underline" href="/keychain">
        your keychain
      </Link>
      .
    </p>
  )
}
