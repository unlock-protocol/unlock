import Campaigns from '../components/Campaigns'
import Hero from '../components/Hero'

export default function Home() {
  return (
    <div className="flex flex-col gap-10 h-full">
      <Hero />
      <Campaigns />
    </div>
  )
}
