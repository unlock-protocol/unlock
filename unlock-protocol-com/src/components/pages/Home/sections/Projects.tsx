import { Link } from '../../../helpers/Link'
import useEmblaCarousel from 'embla-carousel-react'
import { useState, useCallback, useEffect } from 'react'
import {
  FiArrowLeft as ArrowLeftIcon,
  FiArrowRight as ArrowRightIcon,
} from 'react-icons/fi'
import { twMerge } from 'tailwind-merge'

export const UNLOCK_PROJECTS = [
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/agora-guild.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/agora-guild.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'February, 2022',
    title: 'Guild.xyz',
    text: 'Guild.xyz is a tool for token-curated communities, powered by Agora Space.',
    href: 'https://agora.xyz/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/bakery.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/bakery.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'December, 2021',
    title: 'The Bakery',
    text: 'The Bakery is a media community of researchers, writers, and crypto enthusiasts.',
    href: 'https://bakery.fyi/bakery-nft/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/cdaa.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/cdaa.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'January, 2022',
    title: 'CDAA',
    text: 'CDAA provides industry certification and credentials for digital asset advisors.',
    href: 'https://twitter.com/PlannerDAO/status/1480991827209641988',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/mintgate.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/mintgate.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'November, 2021',
    title: 'MintGate',
    text: 'MintGate is a platform for token-gated access to video, audio, & other content.',
    href: 'https://unlock-protocol.com/blog/mintgate-unlock-case-study',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/ethanglia.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/ethanglia.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'February, 2022',
    title: 'ETHAnglia',
    text: 'ETHAnglia is bringing web3 to the East of England.',
    href: 'https://ethanglia.org/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/willow.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/willow.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'January, 2022',
    title: 'The Willow Tree',
    text: 'The Willow Tree is a  community for bridging web3 and rave culture.',
    href: 'https://www.twtdao.xyz/',
  },
]

export function Projects() {
  const [viewportRef, embla] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
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
    <section className="max-w-6xl py-12 mx-auto sm:py-24">
      <header className="px-6">
        <div className="flex items-center justify-between pl-1">
          <h2 className="text-xl font-bold sm:text-3xl">
            Explore Active Projects
          </h2>
          <div className="flex gap-2">
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
      <div className="sm:px-6">
        <div className="w-full overflow-hidden cursor-move" ref={viewportRef}>
          <div className="flex gap-8 p-6 ml-4 select-none">
            {UNLOCK_PROJECTS.map(
              ({ href, coverClass, title, text, published }, index) => {
                const date = new Date(published)
                const textDate = date.toLocaleDateString('default', {
                  month: 'long',
                  year: 'numeric',
                })
                return (
                  <Link key={index} href={href}>
                    <div className="relative flex flex-col overflow-hidden w-72 group h-96 rounded-3xl">
                      <div
                        style={{
                          backgroundPosition: 'center',
                        }}
                        className={twMerge(
                          'object-cover h-full w-full absolute group-hover:transition-all',
                          coverClass
                        )}
                      >
                        <div className="absolute z-10 flex flex-col justify-end h-full p-8 text-white">
                          <time className="text-sm" dateTime={textDate}>
                            {textDate}
                          </time>
                          <h4 className="text-xl font-bold"> {title} </h4>
                          <p className="hidden group-hover:block"> {text} </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              }
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
