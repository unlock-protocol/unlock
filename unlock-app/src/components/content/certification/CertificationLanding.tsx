import React from 'react'
import EventContent from '../EventContent'
import { Button } from '@unlock-protocol/ui'
import Image from 'next/image'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'

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

const features = [
  {
    image: '/images/illustrations/certifications/img-continueedu.svg',
    name: 'Award certifications based on proven expertise',
    description:
      'You can grant certifications and credentials to individuals or organizations that pass exams, attend continuing education training, or meet specific criteria.',
  },
  {
    image: '/images/illustrations/certifications/img-validation.svg',
    name: 'Validate certifications online and onchain',
    description: `Verify certifications and credentials through third parties or directly on the blockchain. Since certifications can't be transferred and can be set to expire (if required), you know the certification is valid.`,
  },
  {
    image: '/images/illustrations/certifications/img-sharelinkedin.svg',
    name: 'Share on LinkedIn and elsewhere',
    description:
      'Individuals can share their certifications on LinkedIn, on their personal websites or social media, as well as on their resume or CV.',
  },
]

const faqs = [
  {
    title: 'Will certificants need wallets?',
    description:
      'No! Certificants do not need wallets, but they will need user accounts if they do not have their own wallets. Unlock accounts require an email and password.',
  },
  {
    title: 'What blockchain is this on?',
    description:
      'You can pick between all the networks on which the Unlock Protocol has been deployed: Polygon, Gnosis Chain, Optimism, and others.',
  },
  {
    title: 'Can I charge for the certification?',
    description:
      'Yes, when deploying your contract you can pick a currency, as well as enable credit card, Apple Pay and Google Pay.',
  },
  {
    title: 'Can I set certifications to expire?',
    description:
      'Yes, certifications can be set to expire and require renewal after one year, two years, or any length of time you desire.',
  },
]

export const CertificationLanding = ({
  handleCreateCertification,
}: CertificationLandingProps) => {
  return (
    <LockTypeLandingPage
      title={
        <h1
          style={{
            backgroundImage:
              'linear-gradient(85.7deg, #603DEB 3.25%, #27C1D6 90.24%)',
          }}
          className="text-4xl font-extrabold text-transparent uppercase md:text-8xl bg-clip-text"
        >
          Certifications
          <br />
          show <br />
          expertise
        </h1>
      }
      faqs={faqs}
      illustration={
        <div className="items-start justify-center hidden w-96 md:flex justify-items-center shrink-0">
          <Image
            className=""
            width="486"
            height="652"
            alt="Hand off doc"
            src="/images/illustrations/certifications/img-handoffDoc.svg"
          />
        </div>
      }
      coverImage="/images/illustrations/certifications/img-professionals.svg"
      subtitle="Bring your certification or credentialing program onchain with Unlock."
      description="Unlock Protocol brings certifications and credentials into web3. Deploy a contract, issue credentials, and perform verfication. All onchain, all in minutes."
      actions={
        <Button onClick={handleCreateCertification} className="my-8">
          Create your certification now
        </Button>
      }
      callToAction={{
        title: 'Easy to set up, provably secure credentialing',
        subtitle:
          'Issue transparent, provable credentials for professional certifications, continuing education credits, industry expertise, and more.',
        description:
          'Since the certifications and credentials are represented as NFTs, they can also be as visually appealing as you would like them to be and can support your brand and marketing strategy.',
        actions: (
          <Button onClick={handleCreateCertification} className="my-8">
            Create your certification now
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
