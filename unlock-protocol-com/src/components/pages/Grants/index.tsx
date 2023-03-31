import { Button } from '@unlock-protocol/ui'
import { Link } from '../../helpers/Link'
import { BsLaptop as LaptopIcon } from 'react-icons/bs'
import { HiSpeakerphone as SpeakerPhoneIcon } from 'react-icons/hi'
import { FaHandsHelping as HelpingIcon } from 'react-icons/fa'
import { MdGeneratingTokens as TokenIcon } from 'react-icons/md'
import { AiOutlineLink as LinkIcon } from 'react-icons/ai'
import { UnlockIcon } from '../../icons/Unlock'

const UNLOCK_GRANT_APPLICATION_LINK =
  'https://docs.unlock-protocol.com/governance/grants-bounties/udt-grantee-handbook'

const UNLOCK_GRANT_PROGRAM_LINK =
  'https://docs.unlock-protocol.com/governance/grants-bounties/udt-grants'

const UNLOCK_GRANT_HELP = [
  {
    Icon: TokenIcon,
    title: 'UDT token grant',
    text: 'The Unlock DAO approves grants of 100, 200 or 300 UDT tokens or other amounts to teams and individuals building with Unlock!',
  },
  {
    Icon: LaptopIcon,
    title: 'Technical Guidance for Project Development',
    text: "Get help from our developers on Discord! We'll provide feedback and prioritize your issues.",
  },
  {
    Icon: SpeakerPhoneIcon,
    title: 'Marketing & Promotional Support',
    text: "We'll help you promote your project, clarify your pitch, and co-market with you on our blog and social media.",
  },
  {
    Icon: HelpingIcon,
    title: 'Connect with other developers and users',
    text: 'Launch and connect with other grantees, community members and Unlock users at hackathons and our virtual developer meetups!',
  },
]

const UNLOCK_GRANT_COMMITTEE = [
  {
    name: 'Crystal Street',
    socialURL: 'https://twitter.com/crystaldstreet',
    text: 'Founding Member JournoDAO',
    avatarURL: '/images/marketing/grants/crystal-street.png',
  },
  {
    name: 'White Hat',
    text: 'Founder of White Hat DAO',
    socialURL: 'https://twitter.com/White_Hat_DAO',
    avatarURL: '/images/marketing/grants/white-hat.png',
  },
  {
    name: 'Henry Hoffman',
    text: 'BAFTA-winning Game Designer',
    socialURL: 'https://twitter.com/HenryHoffman',
    avatarURL: '/images/marketing/grants/henry-hoffman.png',
  },
]

const UNLOCK_GRANT_CRITERIA = [
  {
    title: 'Visibility',
    text: 'How many people will see that Unlock is being used?',
  },
  {
    title: 'Credibility',
    text: 'How much credibility will Unlock gain from the project?',
  },
  {
    title: 'Gross Network Product',
    text: 'How much revenue will this incur for the network?',
  },
]

const UNLOCK_PAST_COHORTS = [
  {
    name: 'SwordyBot',
    avatarURL: '/images/marketing/grants/patrick-gallagher.png',
    socialURL: 'https://twitter.com/pi0neerpat',
    by: 'Patrick Gallagher',
    text: 'SwordyBot uses Unlock Protocol to let Discord administators automatically grant or limit access to Discord channels based on NFTs.',
  },
  {
    name: 'Puma Browser',
    avatarURL: '/images/marketing/grants/yuriy-dybskiy.png',
    by: 'Yuriy Dybskiy',
    socialURL: 'https://twitter.com/html5cat',
    text: 'Puma - a mobile browser and wallet for the Web3 ecosystem - is integrating with Unlock.',
  },
  {
    name: 'Unlock Firebase Plugin',
    avatarURL: '/images/marketing/grants/david-layton.png',
    by: 'David Layton',
    socialURL: 'https://www.linkedin.com/in/david-matthew-layton',
    text: 'Firebase plugin for unlock to allow anyone using firebase to quickly token-gate parts of their app.',
  },
  {
    name: 'Dinner DAO',
    avatarURL: '/images/marketing/grants/austin-robey.png',
    by: 'Austin Robey',
    socialURL: 'https://twitter.com/austinrobey_',
    text: 'Unlock Protocol-powered NFTs that allow groups to meet over a great meal.',
  },
  {
    name: 'Tales of Elatora',
    avatarURL: '/images/marketing/grants/caroline.png',
    by: 'Caroline',
    socialURL: 'https://twitter.com/littlefortunes',
    text: 'A NFT Artist who uses Unlock to token-gate their story writing. Members can vote on the story. ',
  },
  {
    name: 'Decentraland',
    avatarURL: '/images/marketing/grants/henry-hoffman.png',
    by: 'Henry Hoffman',
    socialURL: 'https://twitter.com/henryhoffman',
    text: 'Unlock Decentraland Integration allow you to token-gate access to digital spaces and sell memberships in Decentraland ',
  },
]

export function Grants() {
  return (
    <div className="p-6">
      <div className="mx-auto  max-w-7xl">
        <section className="space-y-8">
          <header className="flex flex-col items-center justify-center space-y-2 text-center">
            <h1 className="heading">Unlock Grant Program</h1>
            <p className="sub-heading">
              Unlock&apos;s Grant program provides grants to developers around
              the world.
            </p>
          </header>
          <div className="flex justify-center">
            <Button
              as={Link}
              href={UNLOCK_GRANT_APPLICATION_LINK}
              iconLeft={<UnlockIcon key={1} className="fill-white" size={16} />}
            >
              Apply to Unlock Grant Program
            </Button>
          </div>
        </section>

        <section className="py-8 space-y-8 md:py-16">
          <header className="flex flex-col items-center justify-center space-y-1 text-center">
            <h2 className="text-xl font-semibold sm:text-3xl">
              How does Unlock Grant Program help developers?
            </h2>
          </header>
          <div className="grid items-center gap-8 sm:grid-cols-2">
            {UNLOCK_GRANT_HELP.map(({ title, text, Icon }, index) => (
              <div
                className="flex flex-col justify-between h-full gap-4 p-8 glass-pane rounded-xl"
                key={index}
              >
                <div>
                  <Icon className="fill-brand-ui-primary" size={48} />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-brand-gray"> {text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-12 sm:pt-12">
          <header className="flex flex-col items-center justify-center space-y-1 text-center">
            <h3 className="heading-small">
              Check out projects from our grantees
            </h3>
            <p className="sub-heading-small">
              Some amazing applications built using Unlock with support of our
              grant program.
            </p>
          </header>
          <div className="space-y-8">
            <section>
              <div className="grid items-center w-full gap-6 p-8 sm:grid-cols-2 glass-pane rounded-3xl">
                <div className="rounded-3xl max-w-fit">
                  <div className="pb-4">
                    <h3 className="text-xl font-semibold sm:text-2xl">
                      Guild.xyz
                    </h3>
                    <p className="font-medium"> by Guild xyz team </p>
                  </div>
                  <div className="space-y-2 leading-relaxed">
                    <p>
                      Guild allows you to manage and lock your community behind
                      tokens and NFTs. It has an amazing interface for
                      programming your own token walls.
                    </p>
                    <Link
                      className="inline-flex items-center gap-2 px-2 2 py-0.5 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                      href="https://guild.xyz"
                    >
                      guild.xyz
                      <LinkIcon />
                    </Link>
                  </div>
                </div>
                <Link href="https://guild.xyz">
                  <img
                    className="rounded"
                    alt="Guild XYZ"
                    src="/images/marketing/grants/guild-xyz.png"
                  />
                </Link>
              </div>
            </section>
            <section>
              <div className="grid items-center w-full gap-6 p-8 sm:grid-cols-2 glass-pane rounded-3xl">
                <div className="max-w-fit">
                  <div className="pb-4">
                    <h3 className="text-xl font-semibold sm:text-2xl">
                      Web3 Academy Pro
                    </h3>
                    <p className="font-medium"> by Kyle Reidhead </p>
                  </div>
                  <div className="space-y-2 leading-relaxed">
                    <p>
                      A place for entrepreneurs, creators and business
                      professionals to learn, network and stay on the forefront
                      of Web3 Innovation. Using Unlock for their subscription
                      services.
                    </p>
                    <Link
                      className="inline-flex items-center gap-2 px-2 2 py-0.5 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                      href="https://w3academy.io/"
                    >
                      w3academy.io
                      <LinkIcon />
                    </Link>
                  </div>
                </div>
                <Link href="https://w3academy.io/">
                  <img
                    className="rounded"
                    alt="Web3 Academy"
                    src="/images/marketing/grants/web3-academy.png"
                  />
                </Link>
              </div>
            </section>
          </div>
        </section>
        <section className="pt-16">
          <header className="flex flex-col items-center justify-center pb-8 space-y-1 text-center">
            <h3 className="heading-small">
              Meet folks from our previous cohorts
            </h3>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {UNLOCK_PAST_COHORTS.map(
              ({ by, text, socialURL, name, avatarURL }, index) => (
                <Link href={socialURL} key={index}>
                  <div className="h-full p-6 space-y-4 text-center glass-pane rounded-3xl">
                    <header className="flex flex-col items-center justify-center ">
                      <img
                        className="w-20 mb-6 rounded-full"
                        src={avatarURL}
                        alt={by}
                      />
                      <div>
                        <h4 className="font-semibold"> {name} </h4>
                        <p className=" text-brand-gray"> {by} </p>
                      </div>
                    </header>
                    <p>{text}</p>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>
        <section className="pt-24 space-y-24">
          <header className="flex flex-col items-center justify-center space-y-1 text-center">
            <h3 className="heading-small">A decentralized Grant Committee</h3>
            <p className="max-w-prose sub-heading-small">
              Some of our earliest Unlock grantees and community members help
              review and provide feedback to Unlock Grant applicants both during
              application and through the lifetime of the grant.
            </p>
          </header>
          <section>
            <div className="flex flex-col justify-center gap-8 sm:flex-row">
              {UNLOCK_GRANT_COMMITTEE.map(
                ({ avatarURL, socialURL, name, text }, index) => (
                  <Link href={socialURL} key={index}>
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div>
                        <img
                          className="w-24 rounded-full"
                          alt={name}
                          src={avatarURL}
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <h4 className="font-medium"> {name}</h4>
                        <p className="text-brand-gray"> {text}</p>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>
          <section>
            <header className="flex flex-col items-center justify-center space-y-1 text-center">
              <h3 className="heading-small">Grant Review Criteria</h3>
              <p className="sub-heading-small">
                We have set some criteria to help the Unlock DAO find the best
                teams and projects to support.
              </p>
            </header>
            <div className="grid gap-4 pt-8 sm:grid-cols-2 md:grid-cols-3">
              {UNLOCK_GRANT_CRITERIA.map(({ title, text }, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-4 text-center glass-pane rounded-3xl"
                >
                  <h4 className="text-lg font-medium"> {title}</h4>
                  <p className="text-brand-gray"> {text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pb-24 space-y-8">
            <header className="flex flex-col items-center justify-center space-y-1 text-center">
              <h3 className="heading-small">
                What are you waiting for? Apply today.
              </h3>
              <p className="sub-heading-small">
                The community reviews each application as quickly as possible.
              </p>
            </header>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                as={Link}
                href={UNLOCK_GRANT_APPLICATION_LINK}
                iconLeft={
                  <UnlockIcon key={1} className="fill-white" size={16} />
                }
              >
                Apply to Unlock Grant Program
              </Button>
              <Button
                as={Link}
                href={UNLOCK_GRANT_PROGRAM_LINK}
                variant="secondary"
              >
                Read FAQs
              </Button>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
