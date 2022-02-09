import { Connect } from './sections/Connect'
import { Developer } from './sections/Developer'
import { Steps } from './sections/Steps'
import { MarketingLayout } from '../../layout/MarketingLayout'
import { Public } from './sections/Public'

const SECTIONS = [Connect, Steps, Developer, Public]

export function Home() {
  return (
    <MarketingLayout>
      <div className="grid gap-8 sm:gap-24">
        {SECTIONS.map((Section, index) => (
          <div key={index}>
            <Section />
          </div>
        ))}
      </div>
    </MarketingLayout>
  )
}
