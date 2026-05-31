'use client'

import React from 'react'
import EventContent from '../EventContent'
import { Button } from '@unlock-protocol/ui'
import Image from 'next/image'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'
import { useTranslations } from '~/contexts/LanguageContext'

interface CertificationLandingProps {
  handleCreateCertification: () => void
}

const customers = [
  {
    name: 'Web3 Academy',
    link: 'https://w3academy.io',
    image: '/images/illustrations/certifications/logo-web3-academy.png',
  },
  {
    name: 'CDAA',
    link: 'https://unlock-protocol.com/blog/cdaa-unlock-case-study',
    image: '/images/illustrations/certifications/logo-cdaa.png',
  },
  {
    name: 'Hay There Social Media',
    link: 'https://haytheresocialmedia.com/',
    image: '/images/illustrations/certifications/logo-heytheresocialmedia.png',
  },
]

const featureImages = [
  {
    image: '/images/illustrations/certifications/img-continueedu.svg',
  },
  {
    image: '/images/illustrations/certifications/img-validation.svg',
  },
  {
    image: '/images/illustrations/certifications/img-sharelinkedin.svg',
  },
]

export const CertificationLanding = ({
  handleCreateCertification,
}: CertificationLandingProps) => {
  const t = useTranslations('certification')
  const features = featureImages.map((feature, index) => ({
    ...feature,
    name: t(`features.${index}.name`),
    description: t(`features.${index}.description`),
  }))
  const faqs = [0, 1, 2, 3].map((index) => ({
    title: t(`faqs.${index}.title`),
    description: t(`faqs.${index}.description`),
  }))

  return (
    <LockTypeLandingPage
      title={
        <h1
          style={{
            backgroundImage:
              'linear-gradient(85.7deg, #603DEB 3.25%, #27C1D6 90.24%)',
          }}
          className="text-4xl font-extrabold text-transparent uppercase md:text-7xl bg-clip-text"
        >
          {t('heroTitleLine1')}
          <br />
          {t('heroTitleLine2')} <br />
          {t('heroTitleLine3')}
        </h1>
      }
      faqs={faqs}
      illustration={
        <Image
          className=""
          width="324"
          height="434"
          alt="Hand off doc"
          src="/images/illustrations/certifications/img-handoffDoc.svg"
        />
      }
      coverImage="/images/illustrations/certifications/img-professionals.svg"
      subtitle={t('subtitle')}
      description={t('description')}
      actions={
        <Button onClick={handleCreateCertification} className="my-8">
          {t('cta')}
        </Button>
      }
      callToAction={{
        title: t('callToActionTitle'),
        subtitle: t('callToActionSubtitle'),
        description: t('callToActionDescription'),
        actions: (
          <Button onClick={handleCreateCertification} className="my-8">
            {t('cta')}
          </Button>
        ),
      }}
      features={features}
      customers={{
        items: customers,
      }}
    />
  )
}

export default EventContent
