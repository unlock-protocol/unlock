'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { Container } from './layout/Container'
import airDrops from '../src/airdrops.json'
import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'

interface CampaignCardProps {
  title: string
  description: string
  contractAddress: string
  isEligible: boolean
  authenticated: boolean
}

const CampaignCard = ({
  title,
  description,
  contractAddress,
  isEligible,
  authenticated,
}: CampaignCardProps) => {
  return (
    <Link
      href={`#${contractAddress}`}
      className={`block h-full p-6 space-y-4 border min-w-[24rem] sm:min-w-[28rem] rounded-xl transition-all duration-200 ${
        authenticated
          ? isEligible
            ? 'hover:border-brand-ui-primary'
            : 'opacity-50 cursor-not-allowed hover:border-gray-200'
          : ''
      }`}
    >
      <div className="space-y-4">
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-gray-600 line-clamp-3">{description}</p>
        <div className="flex items-center justify-between">
          <Button disabled={!authenticated || !isEligible}>
            {!authenticated
              ? 'Connect Wallet'
              : isEligible
                ? 'Claim Rewards'
                : 'Not Eligible'}
          </Button>
          {authenticated && (
            <div
              className={`text-sm font-medium ${
                isEligible ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {isEligible ? 'Eligible' : 'Not Eligible'}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

const CampaignsContent = () => {
  const [viewportRef, embla] = useEmblaCarousel({
    dragFree: true,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])

  const onSelect = useCallback(() => {
    if (!embla) return
    setPrevBtnEnabled(embla.canScrollPrev())
    setNextBtnEnabled(embla.canScrollNext())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    embla.on('select', onSelect)
    onSelect()
  }, [embla, onSelect])

  const { authenticated } = usePrivy()

  return (
    <Container>
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-3xl">
              Ongoing Campaigns
            </h2>
            <p className="text-lg text-gray-600">
              Claim your rewards from eligible campaigns.
            </p>
          </div>

          <div className="justify-end hidden gap-4 sm:flex">
            <button
              className="p-2 border rounded-full disabled:opacity-25 disabled:cursor-not-allowed border-gray-300"
              aria-label="previous"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
            >
              <FiArrowLeft size={24} />
            </button>
            <button
              className="p-2 border rounded-full disabled:opacity-25 disabled:cursor-not-allowed border-gray-300"
              aria-label="next"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
            >
              <FiArrowRight size={24} />
            </button>
          </div>
        </header>

        <div className="relative max-w-fit">
          <div className="overflow-hidden cursor-move" ref={viewportRef}>
            <div className="flex gap-8 py-6 select-none">
              {airDrops.map((drop) => (
                <CampaignCard
                  key={drop.contractAddress}
                  contractAddress={drop.contractAddress}
                  title={drop.title}
                  description={drop.description}
                  isEligible={drop.isEligible}
                  authenticated={authenticated}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default function Campaigns() {
  const { authenticated } = usePrivy()

  if (!authenticated) {
    return null
  }

  return (
    <div id="campaigns-section">
      <CampaignsContent />
    </div>
  )
}
