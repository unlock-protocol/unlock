import { Disclosure } from '@headlessui/react'
import { Button } from '@unlock-protocol/ui'
import { BsPlusLg as PlusIcon } from 'react-icons/bs'
import { Icon } from '@unlock-protocol/ui'
import Image from 'next/image'
import Link from 'next/link'

interface AccordionProps {
  title: string
  children: React.ReactNode
}

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

const Accordion = ({ title, children }: AccordionProps) => {
  return (
    <Disclosure>
      {() => (
        <>
          <Disclosure.Button className="border-t flex w-full py-2 text-left border-gray-600 justify-between">
            <span className="text-xl font-semibold">{title}</span>
            <span className="place-self-end	mx-4">
              <Icon icon={PlusIcon} size={24} />
            </span>
          </Disclosure.Button>
          <Disclosure.Panel className="text-sm md:w-2/3 mb-8">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

interface LandingPage {
  handleCreateEvent: () => void
}

export const LandingPage = ({ handleCreateEvent }: LandingPage) => {
  return (
    <div>
      <section className="flex flex-col md:flex-row my-8">
        {/* masthead */}
        <div className="flex flex-col py-0 md:pr-10">
          {/* left */}
          <h1 className="uppercase text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-ui-primary to-[#F19077]">
            Web3 is
            <br />
            better in <br />
            real life.
          </h1>
          <h2 className="text-3xl font-bold mt-4">
            Create event tickets and landing pages for your IRL events in
            minutes with Unlock.
          </h2>
          <p className="my-6">
            Unlock Protocol empowers everyone to create events the true web3
            way. Deploy a contract, sell tickets as NFTs, and perform check-in
            with a dedicated QR code. We got it covered.
          </p>
          <p className="flex justify-center md:justify-start">
            <Button onClick={handleCreateEvent} className="my-8">
              Create your event now
            </Button>
          </p>
        </div>
        <div className="hidden md:flex justify-center justify-items-center">
          <Image
            className=""
            width="769"
            height="978"
            alt="Out Metaverse"
            src="/images/illustrations/events/outmetaverse.svg"
          ></Image>
        </div>
      </section>
      <div className="flex flex-col justify-items-center justify-center content-center items-center">
        <Image
          alt="party"
          width="1440"
          height="320"
          src="/images/illustrations/events/party.svg"
        />
      </div>

      <section className="absolute left-0 justify-items-center justify-center content-center items-center	text-white bg-black w-screen	flex flex-col py-8">
        <h1 className="text-xl font-semibold">Used by</h1>
        <ul className="flex flex-row my-8">
          {customers.map(({ link, image, name }) => {
            return (
              <li
                key={name}
                className="md:mx-12 mx-2 flex items-center rounded-full text-center w-24 h-24"
              >
                <Link target="_blank" href={link}>
                  <Image
                    width="100"
                    height="100"
                    alt={name}
                    src={image}
                  ></Image>
                  <h4 className="mt-auto">{name}</h4>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="flex flex-col mt-96 justify-items-center	justify-center content-center items-center">
        <h3 className="text-5xl font-semibold text-center md:w-2/3">
          Ticketing events with Unlock is simple.
        </h3>
        <p className="text-center md:w-1/2 mt-4">
          From creating the event description to selling tickets to check-in,
          Unlock built the tools you need.
        </p>
        <ul className="grid md:grid-cols-[300px_300px_300px] gap-8 my-8">
          {features.map(({ image, name, description }) => {
            return (
              <li key={name}>
                <Image
                  className="border border-1 rounded-lg border-ui-main-100"
                  width="400"
                  height="300"
                  alt="No-code"
                  src={image}
                ></Image>
                <h3 className="text-xl font-bold mb-2 mt-2">{name}</h3>
                <p className="text-sm">{description}</p>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="flex flex-col mt-8 justify-items-center	justify-center content-center items-center">
        <Button onClick={handleCreateEvent}>Create your event now</Button>
        <p className="md:w-1/3 mt-6 text-xs text-center">
          Psst, you can also Airdrop tickets to frens or have them stake. Just
          cherry on your sundae for other customization.
        </p>
      </section>
      <section className="my-32">
        <h3 className="text-center text-3xl font-bold my-12">
          Frequently Asked Questions
        </h3>
        <Accordion title="Will attendees need wallets?">
          <p>
            No! Attendees do not need wallets, but they will need user accounts
            if they do not have their own wallets. Unlock accounts require an
            email and password.
          </p>
        </Accordion>
        <Accordion title="What blockchain is this on?">
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
        </Accordion>
        <Accordion title="Can I charge for the tickets?">
          <p>
            Yes, when deploying your contract you can pick a currency, as well
            as enable credit card, Apple Pay and Google Pay.
          </p>
        </Accordion>
        <Accordion title="Are attending receiving tickets?">
          <p>
            Yes they are! Once the blockchain transaction is completed, they
            will receive an email that includes a ticket. On this ticket there
            is a unique QR code that can be scanned by organizers to verify its
            validity.Additionally, verifiers can &quot;redeem&quot; the QR code
            so that if another attendee arrives with the same QR code, they will
            be rejected!
          </p>
        </Accordion>
      </section>
    </div>
  )
}
