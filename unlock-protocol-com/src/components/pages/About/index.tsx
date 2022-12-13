import { Button } from '@unlock-protocol/ui'
import { Link } from '../../helpers/Link'
import { AboutDisclosure } from './AboutDisclosure'
import { LabsSection } from './LabsSection'

const AboutSection = () => {
  return (
    <div>
      <div className="container px-6 mx-auto md:max-w-xl sm:px-0">
        <div className="flex flex-col gap-8">
          <img
            className="h-8 md:h-12"
            src="/images/pages/svg/img-deco-about.svg"
            alt="img-deco"
          />
          <span className="text-xl text-center">
            Unlock Protocol belongs to the Unlock Ecosystem, not Unlock Labs,
            and is governed by the Unlock DAO.
            <br />
            <br />
            We aim for Unlock Protocol to be the primitive for every membership,
            both online and offline, around the globe. Together, we will create
            an internet owned and monetized by creators and their supporters.
            <br />
            <br />
            Learn more from the interdependent components of Unlock.
          </span>
        </div>
      </div>
    </div>
  )
}

const MissionSection = () => {
  return (
    <div className="py-24 bg-brand-yellow">
      <div className="container grid grid-cols-1 gap-6 px-6 mx-auto sm:px-0 max-w-7xl md:grid-cols-2 ">
        <span className="text-4xl font-bold text-white">
          We believe there is a way to make memberships better and, as a result,
          we believe there is a way to make the web better.
        </span>
        <span className="text-2xl text-white">
          {`Unlock is a protocol developers, creators, and platforms can use to
        create memberships. Unlock's goal is to ease implementation and increase
        conversion from “users” to “members,” creating a much healthier
        monetization environment for the web.`}
          <br />
          <br />
          In short, Unlock is an open-source, collectively owned,
          community-governed, peer-to-peer system that creates time-based
          memberships.
        </span>
      </div>
    </div>
  )
}

export function About() {
  return (
    <div className="pt-20">
      <div
        style={{
          backgroundImage: 'url("/images/pages/png/img-hero-about.png")',
        }}
        className="h-screen bg-cover"
      >
        <header className="container flex flex-col gap-6 px-6 mx-auto text-center sm:px-0 max-w-7xl md:px-10">
          <span className="text-2xl font-bold text-brand-dark">
            About Unlock Protocol
          </span>
          <h1 className="text-5xl font-bold md:text-7xl text-brand-dark">
            Streamline membership benefits for online communities.
          </h1>
          <span className="text-2xl">
            {`Unlock is meant to help creators find ways to monetize without relying
          on a middleman. It's an open source protocol — and not a centralized
          platform that controls everything that happens on it.`}
          </span>
        </header>
      </div>

      <MissionSection />
      <div className="mt-20 md:mt-32">
        <AboutSection />
      </div>

      <div className="container px-6 mx-auto my-20 sm:px-0 max-w-7xl">
        <div className="border-t border-b border-gray-700 divide-y divide-gray-700 divide-y-black">
          <AboutDisclosure title="LABS" icon={<>🙌</>}>
            <LabsSection />
          </AboutDisclosure>
          <AboutDisclosure title="PROTOCOL" icon={<>✊</>}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:mb-10">
              <span className="text-xl text-brand-dark">
                Lorem ipsum dolor sit amet consectetur. Viverra iaculis felis
                elementum mus. Lectus nunc urna elit scelerisque gravida eget
                sed suscipit. Nunc augue sit velit amet nibh vel egestas
                pellentesque.
              </span>
              <div className="flex items-center justify-center bg-gray-100">
                <img src="/images/pages/about/protocol.png" alt="protocol" />
              </div>
            </div>
          </AboutDisclosure>
          <AboutDisclosure title="DAO" icon={<>🤝</>}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:mb-10">
              <span className="text-xl text-brand-dark">
                Lorem ipsum dolor sit amet consectetur. Viverra iaculis felis
                elementum mus. Lectus nunc urna elit scelerisque gravida eget
                sed suscipit. Nunc augue sit velit amet nibh vel egestas
                pellentesque.
              </span>
              <div className="flex items-center justify-center bg-gray-100">
                <img src="/images/pages/about/dao.png" alt="dao" />
              </div>
            </div>
          </AboutDisclosure>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pt-20 pb-24 text-center">
        <span className="text-2xl font-semibold text-brand-dark">
          {`We're always hiring, so get in touch if you want to join us!`}
        </span>
        <div>
          <Link href="https://www.notion.so/unlockprotocol/Unlock-Jobs-907811d15c4d490091eb298f71b0954c">
            <Button>View Job Openings</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
