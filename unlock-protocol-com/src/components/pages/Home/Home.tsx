import { Connect } from './sections/Connect'
import { Developer } from './sections/Developer'
import { Steps } from './sections/Steps'
import { Public } from './sections/Public'
import { Community } from './sections/Community'
import { GetStarted } from './sections/GetStarted'
import { Projects } from './sections/Projects'
import { Recipes } from './sections/Recipes'
import { MembershipExplained } from './sections/MembershipExplained'
export function Home() {
  return (
    <main className="relative">
      <div className="relative">
        <div className="px-6 pt-6 pb-24 sm:pt-12">
          <Connect />
        </div>
        <div className="px-6 pt-6 pb-28 sm:pt-12">
          <MembershipExplained />
        </div>
        <img
          alt="background"
          aria-hidden
          className="absolute sm:hidden left-0 bottom-[34rem] -z-10 not-sr-only"
          src="/images/svg/m-bg-1.svg"
        />
        <img
          alt="background"
          aria-hidden
          className="absolute right-0 not-sr-only -bottom-72 sm:hidden -z-10"
          src="/images/svg/m-bg-2.svg"
        />
        <img
          alt="background"
          aria-hidden
          className="absolute right-0 hidden not-sr-only -top-20 sm:block -z-10"
          src="/images/svg/d-bg-1.png"
        />
      </div>

      <div className="relative px-6 pt-12 pb-24">
        <Steps />
        <img
          alt="background"
          aria-hidden
          className="absolute top-0 right-0 not-sr-only sm:hidden -z-10"
          src="/images/svg/m-bg-3.svg"
        />
        <img
          alt="background"
          aria-hidden
          className="absolute left-0 hidden not-sr-only top-96 sm:block -z-10"
          src="/images/svg/d-bg-2.png"
        />
      </div>
      <div className="relative px-6 pt-12 pb-24">
        <GetStarted />
        <img
          alt="background"
          aria-hidden
          className="absolute left-0 not-sr-only top-48 sm:hidden -z-10"
          src="/images/svg/m-bg-4.svg"
        />
      </div>

      <div className="px-6 pt-12 pb-24">
        <Projects />
      </div>
      <div className="relative pt-12 pb-24">
        <Developer />
        <Recipes />
        <img
          alt="background"
          aria-hidden
          className="absolute right-0 hidden not-sr-only -top-72 sm:block -z-10"
          src="/images/svg/d-bg-3.png"
        />
      </div>
      <div className="relative px-6 pt-12 pb-24">
        <Public />
        <img
          alt="background"
          aria-hidden
          className="absolute right-0 not-sr-only -top-96 sm:hidden -z-10"
          src="/images/svg/m-bg-5.svg"
        />
      </div>
      <div className="relative px-6 pt-12 pb-24 sm:overflow-hidden">
        <Community />
        <img
          alt="background"
          aria-hidden
          className="absolute right-0 not-sr-only top-20 sm:hidden -z-10"
          src="/images/svg/m-bg-6.svg"
        />
        <img
          alt="background"
          aria-hidden
          className="absolute left-0 hidden not-sr-only -top-6 sm:block -z-10"
          src="/images/svg/d-bg-4.svg"
        />
      </div>
    </main>
  )
}
