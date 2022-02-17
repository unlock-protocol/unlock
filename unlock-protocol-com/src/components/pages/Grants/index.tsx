import { Button } from '@unlock-protocol/ui'
import { Link } from '../../helpers/Link'
import { BsLaptop as LaptopIcon } from 'react-icons/bs'
import { HiSpeakerphone as SpeakerPhoneIcon } from 'react-icons/hi'
import { FaHandsHelping as HelpingIcon } from 'react-icons/fa'
import { MdGeneratingTokens as TokenIcon } from 'react-icons/md'
import { AiOutlineLink as LinkIcon } from 'react-icons/ai'
import { UnlockIcon } from '../../icons/Unlock'

const UNLOCK_GRANT_APPLICATION_LINK =
  'https://share.hsforms.com/1gAdLgNOESNCWJ9bJxCUAMwbvg22'

const UNLOCK_GRANT_PROGRAM_LINK =
  'https://docs.unlock-protocol.com/unlock/governance/grants-bounties-and-matchings'

const UNLOCK_GRANT_HELP = [
  {
    Icon: TokenIcon,
    title: 'Get UDT token grant',
    text: 'We will provide you a grant of 100 UDT tokens to kickstart your project on Unlock',
  },
  {
    Icon: LaptopIcon,
    title: 'Technical Guidance for Project Development',
    text: 'Get help from our developers on discord. We will provide suggestions and prioritize your issues.',
  },
  {
    Icon: SpeakerPhoneIcon,
    title: 'Marketing & Promotional Support',
    text: 'We will help you perfect your pitch, provide feedback, and promote you on our social handles with over thousands of followers each.',
  },
  {
    Icon: HelpingIcon,
    title: 'Connecting with community and investors.',
    text: 'We will help you launch, connect with our community members so you can find early users for your product.',
  },
]

const UNLOCK_GRANT_COMMITTEE = [
  {
    name: 'Amber Case',
    text: 'Advisor Unlock Protocol',
    avatarURL: '/images/marketing/grants/amber-case.png',
  },
  {
    name: 'Denise Xifara',
    text: 'Advisor GMG Ventures',
    avatarURL: '/images/marketing/grants/denise-xifara.png',
  },
  {
    name: 'Henry Hoffman',
    text: 'BAFTA-winning Game Designer',
    avatarURL: '/images/marketing/grants/henry-hoffman.png',
  },
  {
    name: 'Patrick Mayr',
    text: 'Advisor Cherry Ventures',
    avatarURL: '/images/marketing/grants/patrick-mayr.png',
  },
]

const UNLOCK_GRANT_CRITERIA = [
  {
    title: 'Impact',
    text: 'Can the project benefit to a large population of users?',
  },
  {
    title: 'Feasibility',
    text: 'Is the solution easy to use and a reasonable implementation?',
  },
  {
    title: 'Team',
    text: 'Does the team have the skills to deliver?',
  },
  {
    title: 'Maturity',
    text: 'Is this a new startup or a launched system with revenue?',
  },
]

const UNLOCK_PAST_COHORTS = [
  {
    name: 'SwordyBot',
    avatarURL: '/images/marketing/grants/patrick-gallagher.png',
    by: 'Patrick Gallagher',
    text: 'SwordyBot uses Unlock Protocol to let Discord administators automatically grant or limit access to Discord channels based on NFTs.',
  },
  {
    name: 'Puma Browser',
    avatarURL: '/images/marketing/grants/yuriy-dybskiy.png',
    by: 'Yuriy Dybskiy',
    text: 'Puma - a mobile browser and wallet for the Web3 ecosystem - is integrating with Unlock.',
  },
  {
    name: 'Unlock Firebase Plugin',
    avatarURL: '/images/marketing/grants/david-layton.png',
    by: 'David Layton',
    text: 'Firebase plugin for unlock to allow anyone using firebase to quickly tokengate parts of their app.',
  },
  {
    name: 'Dinner DAO',
    avatarURL: '/images/marketing/grants/austin-robey.png',
    by: 'Austin Robey',
    text: 'Unlock Protocol-powered NFTs that allow groups to meet over a great meal.',
  },
  {
    name: 'Tales of Ronin',
    avatarURL: '/images/marketing/grants/caroline.png',
    by: 'Carolin',
    text: 'A NFT Artist who uses Unlock to tokengate their story writing. Members can vote on the story. ',
  },
  {
    name: 'Decentraland',
    avatarURL: '/images/marketing/grants/henry-hoffman.png',
    by: 'Henry Hoffman',
    text: 'Unlock Decentraland Integration allow you to token-gate access to digital spaces in Decentraland and also allow visitors to purchase memberships in order to join.',
  },
]

export function Grants() {
  return (
    <div>
      <section className="space-y-4 ">
        <header className="flex flex-col items-center justify-center space-y-2">
          <h1 className="text-3xl font-bold sm:text-5xl">
            Unlock Grant Program
          </h1>
          <p className="text-lg text-center sm:text-xl text-brand-gray">
            Join the Unlock Grant&apos;s program and scale your apps using
            Unlock Protocol with Unlock Team.
          </p>
        </header>
        <div className="flex justify-center">
          <Button
            as={Link}
            href={UNLOCK_GRANT_APPLICATION_LINK}
            iconLeft={<UnlockIcon className="fill-white" size={16} />}
          >
            Apply to Unlock Grant Program
          </Button>
        </div>
      </section>

      <section className="py-8 space-y-8">
        <header className="flex flex-col items-center justify-center space-y-1 text-center">
          <h2 className="text-xl font-bold sm:text-3xl">
            How does Unlock Grant Program help developers?
          </h2>
        </header>
        <div className="grid items-center gap-8 sm:grid-cols-2">
          {UNLOCK_GRANT_HELP.map(({ title, text, Icon }, index) => (
            <div
              className="flex flex-col justify-between gap-4 p-8 glass-pane rounded-xl"
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

      <section className="pt-12 space-y-12">
        <header className="flex flex-col items-center justify-center space-y-1">
          <h3 className="text-xl font-bold sm:text-3xl"> Meet our Grantees </h3>
          <p className="text-lg text-center sm:text-xl text-brand-gray">
            Some of the folks who have built amazing things with Unlock.{' '}
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
                    tokens and NFTs. It has an amazing interface for programming
                    your own token walls.
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
                    MintGate
                  </h3>
                  <p className="font-medium"> by Jennifer Tran </p>
                </div>
                <div className="space-y-2 leading-relaxed">
                  <p>
                    A no-code platform for token gated content uses Unlock to
                    enable creators to offer time-based, subcription-like NFTs.
                  </p>
                  <Link
                    className="inline-flex items-center gap-2 px-2 2 py-0.5 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                    href="https://guild.xyz"
                  >
                    mintgate.io
                    <LinkIcon />
                  </Link>
                </div>
              </div>
              <Link href="https://guild.xyz">
                <img
                  className="rounded"
                  alt="Mintgate"
                  src="/images/marketing/grants/mintgate.png"
                />
              </Link>
            </div>
          </section>
        </div>
      </section>
      <section className="pt-16">
        <header className="flex flex-col items-center justify-center pb-8 space-y-1 text-center">
          <h3 className="text-xl font-bold sm:text-3xl">
            Meet some folks from our previuos cohort
          </h3>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {UNLOCK_PAST_COHORTS.map(({ by, text, name, avatarURL }, index) => (
            <div className="p-6 space-y-4 glass-pane rounded-3xl" key={index}>
              <header className="flex flex-col items-center justify-center text-center">
                <img
                  className="w-20 mb-6 rounded-full"
                  src={avatarURL}
                  alt={by}
                />
                <div>
                  <h4 className="font-semibold"> {name} </h4>
                  <p className="text-brand-gray"> {by} </p>
                </div>
              </header>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="pt-12 space-y-12">
        <header className="flex flex-col items-center justify-center space-y-1 text-center">
          <h3 className="text-xl font-bold sm:text-3xl">
            A decentralized Grant Committee
          </h3>
          <p className="sm:text-lg text-brand-gray">
            We have nominated some of our earliest Unlock Inc. investors,
            grantees and community members to review and select Unlock Grant
            recipients. Winners are chosen for their vision and potential growth
            for the protocol.
          </p>
        </header>
        <section>
          <div className="flex flex-col justify-center gap-8 sm:flex-row">
            {UNLOCK_GRANT_COMMITTEE.map(({ avatarURL, name, text }, index) => (
              <div
                className="flex flex-col items-center justify-center gap-4"
                key={index}
              >
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
            ))}
          </div>
        </section>
        <section>
          <header className="flex flex-col items-center justify-center space-y-1 text-center">
            <h3 className="text-xl font-bold sm:text-3xl">
              Grant Selection Criteria
            </h3>
            <p className="sm:text-lg text-brand-gray">
              We have set some criteria to help our find the best teams and
              projects to help.
            </p>
          </header>
          <div className="grid gap-4 pt-8 sm:grid-cols-2 md:grid-cols-4">
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

        <section className="space-y-4">
          <header className="flex flex-col items-center justify-center space-y-1 text-center">
            <h3 className="text-xl font-bold sm:text-3xl">
              What are you waiting for? Apply today.
            </h3>
            <p className="sm:text-lg text-brand-gray">
              We review each application as fast as possible.
            </p>
          </header>
          <div className="flex items-center justify-center gap-4">
            <Button
              as={Link}
              href={UNLOCK_GRANT_APPLICATION_LINK}
              iconLeft={<UnlockIcon className="fill-white" size={16} />}
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
  )
}
