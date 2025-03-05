'use client'

import Link from 'next/link'
import { ImageBar } from './ImageBar'

interface NoMembersDisplayProps {
  toggleAirdropKeys: () => void
}

const NoMembersDisplay = ({ toggleAirdropKeys }: NoMembersDisplayProps) => {
  const checkoutLink = '/locks/checkout-url'
  return (
    <ImageBar
      src="/images/illustrations/no-member.svg"
      alt="No members"
      description={
        <span>
          Lock is deployed. You can{' '}
          <button
            onClick={toggleAirdropKeys}
            className="outline-none cursor-pointer text-brand-ui-primary"
          >
            Airdrop Keys
          </button>{' '}
          or{' '}
          <Link href={checkoutLink}>
            <span className="outline-none cursor-pointer text-brand-ui-primary">
              Share a purchase link
            </span>
          </Link>{' '}
          to your community.
        </span>
      }
    />
  )
}

export default NoMembersDisplay
