import React from 'react'
import EventContent from '../EventContent'
import { Button } from '@unlock-protocol/ui'
import Image from 'next/image'
import { LockDrivenLandingPage } from '~/components/interface/LockDrivenLandingPage'

interface CertificationLandingProps {
  handleCreateCertification: () => void
}

const customers: any[] = []

const features = [
  {
    image: '',
    name: 'Award certifications based on proven expertise',
    description:
      'You can grant certifications and credentials to individuals or organizations that pass exams, attend continuing education training, or meet specific criteria.',
  },
  {
    image: '/images/illustrations/certifications/img-qr.svg',
    name: 'Validate certifications online and onchain',
    description: `Verify certifications and credentials through third parties or directly on the blockchain. Since certifications can't be transferred and can be set to expire (if required), you know the certification is valid.`,
  },
  {
    image: '/images/illustrations/certifications/img-verifier.svg',
    name: 'Share on LinkedIn and elsewhere',
    description:
      'Individuals can share their certifications on LinkedIn, on their personal websites or social media, as well as on their resume or CV.',
  },
]

const faqs = [
  { title: 'Will certificants need wallets?', description: '' },
  { title: 'What blockchain is this on?', description: '' },
  { title: 'Can I charge for the certification?', description: '' },
  { title: 'Can I set certifications to expire?', description: '' },
]

export const CertificationLanding = ({
  handleCreateCertification,
}: CertificationLandingProps) => {
  return (
    <LockDrivenLandingPage
      title={
        <h1 className="uppercase text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#603DEB] to-[#27C1D6]">
          Certifications
          <br />
          show <br />
          expertise
        </h1>
      }
      faqs={faqs}
      illustration={
        <Image
          className=""
          width="769"
          height="978"
          alt="Out Metaverse"
          src="/images/illustrations/events/outmetaverse.svg"
        ></Image>
      }
      coverImage="/images/illustrations/events/party.svg"
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
      }}
      features={features}
      customers={customers}
    />
  )
}

export default EventContent
