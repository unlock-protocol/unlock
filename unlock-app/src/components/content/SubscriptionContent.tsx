'use client'

import { SubscriptionLandingPage } from './subscription/SubscriptionLandingPage'
import { useRouter } from 'next/navigation'

export const SubscriptionContent = () => {
  const router = useRouter()

  return (
    <SubscriptionLandingPage
      handleCreateSubscription={() => {
        router.push(
          'https://unlock-protocol-19942922.hs-sites.com/unlock-subscription-signup'
        )
      }}
    />
  )
}

export default SubscriptionContent
