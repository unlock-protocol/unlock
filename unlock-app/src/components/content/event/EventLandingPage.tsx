'use client'

import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'
import Image from 'next/image'
import { useTranslations } from '~/contexts/LanguageContext'

const customers = [
  {
    image: '/images/partners/berchain.svg',
    name: 'Berchain',
  },
  {
    image: '/images/partners/metacartel-full.svg',
    name: 'Metacartel',
  },
  {
    image: '/images/partners/ethcc.svg',
    name: 'ETHcc',
  },
  {
    image: '/images/partners/polygonnyc-logo.png',
    name: 'Polygon NYC',
  },
  {
    image: '/images/partners/ethwarsaw.svg',
    name: 'Eth Warsaw',
  },
  {
    image: '/images/partners/ethchi.svg',
    name: 'EthChi',
  },
  {
    image: '/images/partners/womeninweb3.svg',
    name: 'Women in Web3',
  },
  {
    image: '/images/partners/farcon.png',
    name: 'Farcon logo',
  },
  {
    image: '/images/partners/dappcon.svg',
    name: 'DappCon logo',
  },
  {
    image: '/images/partners/ethsafari.svg',
    name: 'EthSafari',
  },
]

const featureImages = [
  {
    image: '/images/illustrations/events/qr.svg',
  },
  {
    image: '/images/illustrations/events/verifier.svg',
  },
  {
    image: '/images/illustrations/events/imgoing.svg',
  },
]

const problemImages = [
  {
    image: '/images/illustrations/events/img-stuck.svg',
  },
  {
    image: '/images/illustrations/events/img-wallet.svg',
  },
  {
    image: '/images/illustrations/events/img-goodvibe.svg',
  },
]

interface EventLandingPageCallToActionProps {
  handleCreateEvent: () => void
}

export const EventLandingPageCallToAction = ({
  handleCreateEvent,
}: EventLandingPageCallToActionProps) => {
  const t = useTranslations('event')

  return (
    <Button onClick={handleCreateEvent} className="my-8">
      {t('cta')}
    </Button>
  )
}

interface LandingPageProps {
  handleCreateEvent: () => void
}
export const EventLandingPage = ({ handleCreateEvent }: LandingPageProps) => {
  const t = useTranslations('event')
  const features = featureImages.map((feature, index) => ({
    ...feature,
    name: t(`features.${index}.name`),
    description: t(`features.${index}.description`),
  }))
  const problems = problemImages.map((problem, index) => ({
    ...problem,
    name: '',
    description: t(`problems.items.${index}.description`),
  }))
  const faqs = [
    {
      title: t('faqs.0.title'),
      description: t('faqs.0.description'),
    },
    {
      title: t('faqs.1.title'),
      description: (
        <>
          <p>
            {t('faqs.1.descriptionBeforeLink')}
            <Link
              className="underline"
              target="_blank"
              href={
                'https://docs.unlock-protocol.com/core-protocol/unlock/networks'
              }
            >
              {t('faqs.1.linkLabel')}
            </Link>
            {t('faqs.1.descriptionAfterLink')}
          </p>
        </>
      ),
    },
    {
      title: t('faqs.2.title'),
      description: t('faqs.2.description'),
    },
    {
      title: t('faqs.3.title'),
      description: t('faqs.3.description'),
    },
  ]

  return (
    <>
      <LockTypeLandingPage
        title={
          <h1
            style={{
              backgroundImage:
                'linear-gradient(85.7deg, #603DEB 3.25%, #F19077 90.24%)',
            }}
            className="text-5xl font-extrabold text-transparent uppercase md:text-7xl bg-clip-text"
          >
            {t('heroTitle')}
          </h1>
        }
        actions={
          <EventLandingPageCallToAction handleCreateEvent={handleCreateEvent} />
        }
        illustration={
          <Image
            width="501"
            height="309"
            alt="Farcon uses Events by Unlock"
            src="/images/illustrations/events/farcon-hero.png"
          />
        }
        coverImage="/images/illustrations/events/party.svg"
        subtitle={t('subtitle')}
        description={t('description')}
        customers={{
          title: t('customersTitle'),
          items: customers,
        }}
        faqs={faqs}
        features={features}
        problemSection={{
          title: t('problems.title'),
          subtitle: t('problems.subtitle'),
          items: problems,
        }}
        callToAction={{
          title: t('callToActionTitle'),
          subtitle: t('callToActionSubtitle'),
          description: t('callToActionDescription'),
          actions: (
            <EventLandingPageCallToAction
              handleCreateEvent={handleCreateEvent}
            />
          ),
        }}
      />
    </>
  )
}
