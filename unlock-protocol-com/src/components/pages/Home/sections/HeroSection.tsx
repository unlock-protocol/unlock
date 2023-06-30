import React from 'react'
import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'

interface HeroSectionProps {
  subhead: string
  title: string
  description: string
}

const HeroSectionDetails: HeroSectionProps = {
  subhead: 'Open source and purpose built',
  title:
    ' Smart contracts built specifically for memberships and subscriptions',
  description:
    'The only smart contracts that let you add time constraints, update pricing, and handle recurring payments.',
}

export default function HeroSection() {
  const { subhead, title, description } = HeroSectionDetails
  return (
    <div className="relative grid gap-8 md:gap-10 md:grid-cols-3">
      <div className="flex flex-col items-start gap-6 md:col-span-2">
        <div className="flex flex-col gap-4">
          <span className="text-2xl font-semibold md:text-3xl text-brand-ui-primary">
            {subhead}
          </span>
          <span className="text-4xl font-bold text-black md:text-7xl">
            {title}
          </span>
        </div>
        <div className="flex flex-col items-start gap-8">
          <div className="text-xl md:text-2xl">{description}</div>
          <Button
            as={Link}
            className="w-full md:w-auto"
            href="https://docs.unlock-protocol.com/"
          >
            Start Building
          </Button>
        </div>
      </div>
      <div className="col-span-1">
        <object
          className="w-full md:w-2/3 4xl:right-0 md:absolute md:top-0"
          type="image/svg+xml"
          data="/images/hero-app-overview.svg"
        />
      </div>
    </div>
  )
}
