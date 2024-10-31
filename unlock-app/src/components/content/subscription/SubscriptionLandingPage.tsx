'use client'

import { Button } from '@unlock-protocol/ui'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'
import Image from 'next/image'

const customers = [
  {
    image: '/images/illustrations/subscriptions/landing/customers/stella.png',
    name: 'Stella',
    children: (
      <div className="mt-2">
        <strong>Stella</strong>
        <p>Subscribe for $5/mo </p>
      </div>
    ),
  },
  {
    image: '/images/illustrations/subscriptions/landing/customers/lit-af.jpeg',
    name: 'Lit-af',
    children: (
      <div className="mt-2">
        <strong>LITAF Podcast</strong>
        <p>Subscribe for $5/mo </p>
      </div>
    ),
  },
  {
    image: '/images/illustrations/subscriptions/landing/customers/dirt.png',
    name: 'Dirt Media',
    children: (
      <div className="mt-2">
        <strong>Dirt Media</strong>
        <p>Subscribe for $60/yr </p>
      </div>
    ),
  },
]

const features = [
  {
    image:
      '/images/illustrations/subscriptions/landing/benefits/artist-and-fans.svg',
    name: 'Fans can support you and meet you where you are',
    description:
      'Connect with your fans and supporters on nearly any creator platform.',
  },
  {
    image: '/images/illustrations/subscriptions/landing/benefits/recurring.svg',
    name: 'Automatically recurring subscriptions',
    description:
      'Predictable recurring revenue for you with subscriptions that renew weekly, monthly, or yearly.',
  },
  {
    image: '/images/illustrations/subscriptions/landing/benefits/get-paid.svg',
    name: 'Get paid instantly whenever you want',
    description:
      'You have direct control of your approach to monetization. Cash out at any time.',
  },
]

const faqs = [
  {
    title: 'What kind of perks can I give my subscribers?',
    description:
      'Subscriber-only content, early access to drops, discounts, online and IRL meetups, swag, and more — nearly any kind of perks are possible.',
  },
  {
    title:
      'What creator platforms are compatible with SUBSCRIPTIONS by Unlock Labs?',
    description:
      'SUBSCRIPTIONS by Unlock Labs is a subscriptions and payments system that is compatible with any creator platform that supports sharing of links. You can ask fans to subscribe anywhere you can share a link in your content or in your creator bio.',
  },
  {
    title: 'What onchain-native platforms are supported?',
    description:
      'SUBSCRIPTIONS by Unlock Labs has been integrated with Farcaster/Warpcast, Paragraph, Pods, Common Ground, P00LS, Bonfire, and many other onchain platforms.',
  },
  {
    title: 'Do I need to be technical to implement this?',
    description:
      'No. Setup and sharing can be done completely without needing to write any code.',
  },

  {
    title: 'How much does it cost?',
    description:
      'There is a 1% protocol fee on subscriptions. This fee is used to support the ongoing development of Unlock Protocol.',
  },
  {
    title: 'Are credit cards supported?',
    description:
      'Yes, fans can support you via credit card as well. Credit card payments will include additional fees, paid by the fan, to cover credit card processing and infrastructure costs.',
  },
]

interface SubscriptionLandingPageCallToActionProps {
  handleCreateSubscription: () => void
}

export const SubscriptionLandingPageCallToAction = ({
  handleCreateSubscription,
}: SubscriptionLandingPageCallToActionProps) => {
  return (
    <div className="flex flex-col">
      <Button onClick={handleCreateSubscription} className="my-8">
        Create your subscription now
      </Button>
    </div>
  )
}

interface LandingPageProps {
  handleCreateSubscription: () => void
}
export const SubscriptionLandingPage = ({
  handleCreateSubscription,
}: LandingPageProps) => {
  return (
    <>
      <LockTypeLandingPage
        title={
          <h1
            style={{
              backgroundImage:
                'linear-gradient(85.7deg, #603DEB 3.25%, #27C1D6 90.24%)',
            }}
            className="text-4xl font-extrabold text-transparent uppercase md:text-7xl bg-clip-text"
          >
            Subscription Management made for creators
          </h1>
        }
        actions={
          <SubscriptionLandingPageCallToAction
            handleCreateSubscription={handleCreateSubscription}
          />
        }
        illustration={
          <Image
            width="375"
            height="231"
            alt="Onchain subscriptions with Unlock Protocol"
            src="/images/illustrations/subscriptions/landing/subscriptions.svg"
          />
        }
        coverImage="/images/illustrations/events/party.svg"
        subtitle="Create. Get paid. Repeat."
        description="The only way for fans to subscribe and support your writing, podcasts, music, digital art, and creativity onchain with automatically recurring payments. Five minute setup."
        customers={{
          items: customers,
        }}
        faqs={faqs}
        features={features}
        callToAction={{
          title: 'Have a direct connection to your fans and supporters',
          subtitle:
            'Create a direct relationship with your fans and supporters independent of any platform',
          description: '',
          actions: (
            <SubscriptionLandingPageCallToAction
              handleCreateSubscription={handleCreateSubscription}
            />
          ),
        }}
      />
    </>
  )
}
