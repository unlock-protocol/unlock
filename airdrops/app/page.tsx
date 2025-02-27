import Campaigns from '../components/Campaigns'
import Hero from '../components/Hero'
import { Metadata } from 'next'
import { config } from '../src/config/app'

export const metadata: Metadata = {
  title: `${config.appName.default} | ${config.appName.brand}`,
  description: config.descriptions.default,
  openGraph: {
    title: `${config.appName.default} | ${config.appName.brand}`,
    description: config.descriptions.default,
  },
  twitter: {
    title: `${config.appName.default} | ${config.appName.brand}`,
    description: config.descriptions.default,
  },
}

export default function Home() {
  return (
    <div className="flex flex-col gap-10 h-full">
      <Hero />
      <Campaigns />
    </div>
  )
}
