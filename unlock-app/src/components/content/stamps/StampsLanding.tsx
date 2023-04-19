import React from 'react'
import { Button } from '@unlock-protocol/ui'
import Image from 'next/image'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'

interface StampsLandingProps {
  handleCreateStamp: () => void
}

const customers: any[] = []

const features = [
  {
    image: '',
    name: 'No-code smart contract deployment',
    description:
      'Simply fill up the form and hit the deploy button. All the metadata information will automatically be included in the NFT tickets. You can always add and modify other properties at later date.',
  },
  {
    image: '',
    name: 'Pair with Unlock Events',
    description: `We make it easy to go from creating an event, to getting attendees checked in at the event, and finally sending them stamps as attendance NFTs. Unlock makes your event from beginning to end a breeze.`,
  },
  {
    image: '',
    name: 'Airdrop or email',
    description: `You can airdrop or email stamps to attendees or they can claim it themselves. Do what's easiest for you and your attendees!`,
  },
]

const faqs = [
  {
    title: 'Will attendees need wallets to get the NFT?',
    description:
      'No! Attendees do not need wallets, but they will need user accounts if they do not have their own wallets. Unlock accounts require an email and password.',
  },
  {
    title: 'What blockchain is this on?',
    description:
      'You can pick between all the networks on which the Unlock Protocol has been deployed: Polygon, Gnosis Chain, Optimism, and others.',
  },
  {
    title: 'Can I charge for the stamp?',
    description:
      'Yes, when deploying your contract you can pick a currency, as well as enable credit card, Apple Pay and Google Pay.',
  },
  {
    title: 'Can I make stamps non-transferrable?',
    description:
      'Yes! After you deploy the contract, you can make the NFTs non-transferrable, or "soul-bound".',
  },
]

export const StampsLanding = ({ handleCreateStamp }: StampsLandingProps) => {
  return (
    <LockTypeLandingPage
      title={
        <h1
          style={{
            backgroundImage:
              'linear-gradient(85.7deg, #603DEB 3.25%, #E8AC11 90.24%)',
          }}
          className="text-4xl font-extrabold text-transparent uppercase md:text-8xl bg-clip-text"
        >
          Stamps
          <br />
          are for <br />
          memories
        </h1>
      }
      faqs={faqs}
      illustration={
        <Image
          className=""
          width="486"
          height="652"
          alt="Hand off doc"
          src="/images/illustrations/certifications/img-handoffDoc.svg"
        />
      }
      coverImage="/images/illustrations/certifications/img-professionals.svg"
      subtitle="Create attendance NFTs as stamps for your participants in minutes with Unlock."
      description="Unlock Protocol makes it easy to to prove that the person holding the NFT attended a specific conference, community event or participated in a community in some other way at a particular time and/or place."
      actions={
        <Button onClick={handleCreateStamp} className="my-8">
          Create your stamp now
        </Button>
      }
      callToAction={{
        title: 'Attendance NFTs with Unlock is simple.',
        subtitle:
          'From creating the NFT to distributing them to attendees, Unlock built the tools you need.',
        description:
          'Psst, we make it easy to upload images so you can make the NFT as visually appealing as you would like them to be and can support your brand and marketing strategy.',
      }}
      features={features}
      customers={customers}
    />
  )
}

export default StampsLanding
