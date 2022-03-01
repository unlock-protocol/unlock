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
    <main>
      <Connect />
      <MembershipExplained />
      <Steps />
      <GetStarted />
      <Projects />
      <Developer />
      <Recipes />
      <Public />
      <Community />
    </main>
  )
}
