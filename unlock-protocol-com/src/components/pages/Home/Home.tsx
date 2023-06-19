import HeroSection from './sections/HeroSection'
import Container from 'src/components/layout/Container'
import SocialProof from './sections/SocialProof'
import ProblemSection from './sections/ProblemSection'
import TheSolution from './sections/TheSolution'
import UnlockStats from './sections/UnlockStats'
import Testimonial from './sections/Testimonial'
import { Button } from '@unlock-protocol/ui'
import { unlockConfig } from 'src/config/unlock'
import Link from 'next/link'

export function Home() {
  return (
    <main className="relative overflow-hidden">
      <Container>
        <HeroSection />
        <div className="mt-16 md:mt-80">
          <SocialProof />
        </div>
        <div className="mt-16 md:mt-48">
          <ProblemSection />
        </div>
        <div className="mt-16 md:mt-48">
          <TheSolution />
        </div>
      </Container>

      <div className="py-24 md:py-32 bg-[#FFFAF1] mt-16 md:mt-48">
        <Container>
          <UnlockStats />
        </Container>
      </div>

      <div className="mt-10 md:mt-32">
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
            href={`${unlockConfig.appURL}/locks/create`}
            variant="outlined-primary"
          >
            Start Building
          </Button>
        </div>
      </Container>
    </main>
  )
}
