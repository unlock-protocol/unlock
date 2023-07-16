import { Button } from '@unlock-protocol/ui'
import Image from 'next/image'
import Link from 'next/link'
import { LockTypeLandingPage } from '~/components/interface/LockTypeLandingPage'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'
import { PastEventsByManager } from './PastEventsByManager'

const customers = [
  {
    link: 'https://ethcc.io/',
    image: '/images/illustrations/events/ethcc.svg',
    name: 'EthCC',
  },
  {
    link: 'https://www.dappcon.io/',
    image: '/images/illustrations/events/dappcon.png',
    name: 'Dappcon',
  },
  {
    link: 'https://www.metacartel.org/',
    image: '/images/illustrations/events/metacartel.png',
    name: 'Metacartel',
  },
]

const features = [
  {
    image: '/images/illustrations/events/easy.svg',
    name: 'No-code smart contract deployment',
    description:
      'Simply fill up the form and hit the deploy button. All the metadata information will automatically be included in the NFT tickets. You can always add and modify other properties at later date.',
  },
  {
    image: '/images/illustrations/events/qr.svg',
    name: 'QR codes and proof of purchase ticketing',
    description:
      'The easiest way to authenticate tickets. Once an attendee purchases a ticket, they will receive an email along with a QR code to check in at the venue.',
  },
  {
    image: '/images/illustrations/events/verifier.svg',
    name: 'Check-ins at the venue are a breeze',
    description:
      'Volunteers or door staff can check attendees in with just a smartphone, and ensure tickets aren’t transferred or reused once someone has come through the door.',
  },
]

const faqs = [
  {
    title: 'Will attendees need wallets?',
    description:
      'No! Attendees do not need wallets, but they will need user accounts if they do not have their own wallets. Unlock accounts require an email and password.',
  },
  {
    title: 'What blockchain is this on?',
    description: (
      <>
        <p>
          You can pick between{' '}
          <Link
            className="underline"
            target="_blank"
            href={`https://docs.unlock-protocol.com/core-protocol/unlock/networks`}
          >
            all the networks on which the Unlock Protocol
          </Link>{' '}
          has been deployed: Polygon, Gnosis Chain, Optimism, ...
        </p>
      </>
    ),
  },
  {
    title: 'Can I charge for the tickets?',
    description:
      'Yes, when deploying your contract you can pick a currency, as well as enable credit card, Apple Pay and Google Pay.',
  },
  {
    title: 'Are attending receiving tickets?',
    description:
      'Yes they are! Once the blockchain transaction is completed, they will receive an email that includes a ticket. On this ticket there is a unique QR code that can be scanned by organizers to verify its validity.Additionally, verifiers can &quot;redeem&quot; the QR code so that if another attendee arrives with the same QR code, they will be rejected!',
  },
]

interface EventLandingPageCallToActionProps {
  handleCreateEvent: () => void
}

export const EventLandingPageCallToAction = ({
  handleCreateEvent,
}: EventLandingPageCallToActionProps) => {
  const { account } = useAuth()
  const { openConnectModal } = useConnectModal()

  if (!account) {
    return (
      <Button onClick={() => openConnectModal()} className="my-8">
        Connect your wallet
      </Button>
    )
  }
  return (
    <>
      <PastEventsByManager manager={account}></PastEventsByManager>
      <Button onClick={handleCreateEvent} className="my-8">
        Get started for free
      </Button>
    </>
  )
}

interface LandingPageProps {
  handleCreateEvent: () => void
}
export const EventLandingPage = ({ handleCreateEvent }: LandingPageProps) => {
  return (
    <LockTypeLandingPage
      title={
        <h1
          style={{
            backgroundImage:
              'linear-gradient(85.7deg, #603DEB 3.25%, #F19077 90.24%)',
          }}
          className="text-6xl font-extrabold text-transparent uppercase md:text-8xl bg-clip-text"
        >
          Easy-peasy
          <br />
          event tickets
          <br />
          and registration
        </h1>
      }
      actions={
        <EventLandingPageCallToAction handleCreateEvent={handleCreateEvent} />
      }
      illustration={
        <Image
          className=""
          width="769"
          height="978"
          alt="Out Metaverse"
          src="/images/illustrations/events/outmetaverse.svg"
        />
      }
      coverImage="/images/illustrations/events/party.svg"
      subtitle="Create event tickets and landing pages for your conference, event, or meetup in under
       five minutes with Unlock Protocol."
      description="Create events in the easiest possible way. Set up
       your event landing page, sell or airdrop tickets as NFTs and via email,
        and perform check-in with a dedicated QR code. Easy."
      customers={customers}
      faqs={faqs}
      features={features}
      callToAction={{
        title: 'Ticketing events with Unlock is simple.',
        subtitle:
          'From creating the event description to selling tickets to check-in, Unlock built the tools you need.',
        description:
          'Psst, you can also Airdrop tickets to frens or have them stake. Just cherry on your sundae for other customization.',
      }}
    />
  )
}
