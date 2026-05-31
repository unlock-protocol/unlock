'use client'

import { Button } from '@unlock-protocol/ui'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'
import Image from 'next/image'
import { useTranslations } from '~/contexts/LanguageContext'

const customers = [
  {
    image: '/images/illustrations/subscriptions/landing/customers/stella.png',
    name: 'Stella',
    label: 'Stella',
  },
  {
    image: '/images/illustrations/subscriptions/landing/customers/lit-af.jpeg',
    name: 'Lit-af',
    label: 'LITAF Podcast',
  },
  {
    image: '/images/illustrations/subscriptions/landing/customers/dirt.png',
    name: 'Dirt Media',
    label: 'Dirt Media',
  },
]

const featureImages = [
  {
    image:
      '/images/illustrations/subscriptions/landing/benefits/artist-and-fans.svg',
  },
  {
    image: '/images/illustrations/subscriptions/landing/benefits/recurring.svg',
  },
  {
    image: '/images/illustrations/subscriptions/landing/benefits/get-paid.svg',
  },
]

interface SubscriptionLandingPageCallToActionProps {
  handleCreateSubscription: () => void
}

export const SubscriptionLandingPageCallToAction = ({
  handleCreateSubscription,
}: SubscriptionLandingPageCallToActionProps) => {
  const t = useTranslations('subscription')

  return (
    <div className="flex flex-col">
      <Button onClick={handleCreateSubscription} className="my-8">
        {t('cta')}
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
  const t = useTranslations('subscription')
  const customerItems = customers.map((customer, index) => ({
    ...customer,
    children: (
      <div className="mt-2">
        <strong>{customer.label}</strong>
        <p>{t(`customers.${index}`)}</p>
      </div>
    ),
  }))
  const features = featureImages.map((feature, index) => ({
    ...feature,
    name: t(`features.${index}.name`),
    description: t(`features.${index}.description`),
  }))
  const faqs = [0, 1, 2, 3, 4, 5].map((index) => ({
    title: t(`faqs.${index}.title`),
    description: t(`faqs.${index}.description`),
  }))

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
            {t('heroTitle')}
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
        subtitle={t('subtitle')}
        description={t('description')}
        customers={{
          items: customerItems,
        }}
        faqs={faqs}
        features={features}
        callToAction={{
          title: t('callToActionTitle'),
          subtitle: t('callToActionSubtitle'),
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
