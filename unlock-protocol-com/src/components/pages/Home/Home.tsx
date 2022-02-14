import { Connect } from './sections/Connect'
import { Developer } from './sections/Developer'
import { Steps } from './sections/Steps'
import { MarketingLayout } from '../../layout/MarketingLayout'
import { Public } from './sections/Public'
import { Community } from './sections/Community'

const SECTIONS = [Connect, Steps, Developer, Public, Community]

export function Home() {
  return (
    <MarketingLayout>
      <div className="grid gap-y-8 sm:gap-y-12 md:gap-y-18">
        {SECTIONS.map((Section, index) => (
          <div key={index}>
            <Section />
          </div>
        ))}
      </div>
    </MarketingLayout>
  )
}
