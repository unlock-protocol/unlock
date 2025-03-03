'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { Container } from './layout/Container'
import airdrops from '../src/airdrops.json'
import { usePrivy } from '@privy-io/react-auth'
import { CampaignCard } from './CampaignCard'

export interface AirdropData {
  id: string
  name: string
  description: string
  contractAddress?: string
  token?: {
    address: string
    symbol: string
    decimals: number
  }
  recipientsFile?: string
  eligible?: number
  url?: string
  chainId?: number
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
            <div className="flex flex-col md:flex-row gap-8 py-6 select-none">
              {(airdrops as AirdropData[]).map((drop, index) => (
                <CampaignCard
                  key={index}
                  airdrop={drop}
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
  return <CampaignsContent />
}
