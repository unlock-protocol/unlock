import { Navigation } from '../../interface/Navigation'
import { Footer } from '../../interface/Footer'
import { Connect } from './sections/Connect'
import { Developer } from './sections/Developer'
import { Steps } from './sections/Steps'

const SECTIONS = [Connect, Steps, Developer]

export function Home() {
  return (
    <div>
      <Navigation />
      <div className="max-w-screen-lg p-4 mx-auto">
        <div className="grid gap-8 py-24 sm:gap-24">
          {SECTIONS.map((Section, index) => (
            <div key={index}>
              <Section />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
