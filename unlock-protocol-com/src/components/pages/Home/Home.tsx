import HeroSection from './sections/HeroSection'
import Container from 'src/components/layout/Container'
import SocialProof from './sections/SocialProof'
import ProblemSection from './sections/ProblemSection'
import TheSolution from './sections/TheSolution'
import UnlockStats from './sections/UnlockStats'
import Testimonial from './sections/Testimonial'
import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'

export function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute -left-28 md:-left-48 md:top-20 top-52">
        <img
          className="w-60 md:w-auto"
          src="/images/illustrations/img-leaf.svg"
          alt=""
        />
      </div>
      <div className="absolute top-0 -right-48">
        <img
          className="md:w-auto w-60"
          src="/images/illustrations/img-umagnetic.svg"
          alt=""
        />
      </div>
      <Container>
        <HeroSection />
        <div className="mt-12 md:mt-80">
          <SocialProof />
        </div>
        <div className="mt-12 md:mt-48">
          <ProblemSection />
        </div>
        <div className="mt-12 md:mt-48">
          <TheSolution />
        </div>
      </Container>

      <div className="py-24 md:py-32 bg-[#FFFAF1] mt-16 md:mt-48">
        <Container>
          <UnlockStats />
        </Container>
      </div>

      <div className="mt-10 md:mt-20">
        <Testimonial />
      </div>

      <Container>
        <div className="flex flex-col items-center w-full gap-6 mt-16 mb-48">
          <span className="mx-auto text-2xl font-bold text-center md:text-3xl">
            Build your first membership contract in minutes.
          </span>
          <Button
            as={Link}
            className="w-auto"
            href="https://docs.unlock-protocol.com"
            variant="outlined-primary"
          >
            Start Building
          </Button>
        </div>
      </Container>
    </main>
  )
}
