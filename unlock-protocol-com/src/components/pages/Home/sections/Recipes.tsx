import {
  FaEthereum as EthereumIcon,
  FaWordpress as WordpressIcon,
} from 'react-icons/fa'
import { Link } from '../../../helpers/Link'
import { AirdropIcon, NFTTicketIcon } from '../../../icons/Util'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

import {
  FiArrowLeft as ArrowLeftIcon,
  FiArrowRight as ArrowRightIcon,
} from 'react-icons/fi'
import { SiWebflow } from 'react-icons/si'

export const UNLOCK_RECIPES = [
  {
    Icon: WordpressIcon,
    text: 'How to use the Ʉnlock WordPress plugin',
    href: 'https://docs.unlock-protocol.com/move-to-guides/plugins-and-integrations/wordpress-plugin',
  },
  {
    Icon: SiWebflow,
    text: 'How to use the Ʉnlock Webflow plugin',
    href: '/blog/webflow-integration',
  },
  {
    Icon: EthereumIcon,
    text: 'How to sign-in with Ethereum Wallet',
    href: 'https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/',
  },
  {
    Icon: NFTTicketIcon,
    text: 'How to build an NFT ticketing solution',
    href: 'https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/',
  },
  {
    Icon: AirdropIcon,
    text: 'How to airdrop memberships',
    href: 'https://unlock-protocol.com/guides/how-to-airdrop-memberships/',
  },
]

export function Recipes() {
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

  return (
    <section className="pt-12 mx-auto max-w-7xl">
      <header className="flex items-center justify-between px-6">
        <h3 className="text-xl font-semibold sm:text-3xl"> Recipes </h3>
        <div className="flex items-center gap-4">
          <div>
            <Link
              href="https://docs.unlock-protocol.com/tutorials/"
              className="text-sm font-medium uppercase text-brand-ui-primary sm:text-base"
            >
              Explore more recipes {'->'}
            </Link>
          </div>
          <div className="justify-end hidden gap-4 sm:flex">
            <button
              className="p-2 border rounded-full disabled:opacity-25 disabled:cursor-not-allowed border-brand-gray"
              aria-label="previous"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
            >
              <ArrowLeftIcon size={24} />
            </button>
            <button
              className="p-2 border rounded-full disabled:opacity-25 disabled:cursor-not-allowed border-brand-gray"
              aria-label="next"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
            >
              <ArrowRightIcon size={24} />
            </button>
          </div>
        </div>
      </header>
      <div className="relative max-w-fit sm:px-6">
        <div className="overflow-hidden cursor-move" ref={viewportRef}>
          <div className="flex gap-8 p-8 ml-4 select-none">
            {UNLOCK_RECIPES.map(({ Icon, text, href }, index) => (
              <Link key={index} href={href}>
                <div className="flex flex-col justify-between h-64 p-6 w-80 glass-pane rounded-3xl">
                  <div>
                    <Icon className="fill-brand-ui-primary" size={60} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium sm:text-xl"> {text}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Recipes
