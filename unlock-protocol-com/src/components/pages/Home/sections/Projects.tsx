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
    published: 'February 2022',
    title: 'Guild.xyz',
    text: 'Guild.xyz is a tool for token-curated communities, powered by Agora Space.',
    href: 'https://unlock-protocol.com/blog/guildxyz-launch',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/bakery.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/bakery.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'December 2021',
    title: 'The Bakery',
    text: 'The Bakery is a media community of researchers, writers, and crypto enthusiasts.',
    href: 'https://bakery.fyi/bakery-nft/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/cdaa.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/cdaa.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'January 2022',
    title: 'CDAA',
    text: 'CDAA provides industry certification and credentials for digital asset advisors.',
    href: 'https://unlock-protocol.com/blog/cdaa-unlock-case-study',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/mintgate.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/mintgate.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'November 2021',
    title: 'MintGate',
    text: 'MintGate is a platform for token-gated access to video, audio, & other content.',
    href: 'https://unlock-protocol.com/blog/mintgate-unlock-case-study',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/ethanglia.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/ethanglia.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'February 2022',
    title: 'ETHAnglia',
    text: 'ETHAnglia is bringing web3 to the East of England.',
    href: 'https://ethanglia.org/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/willow.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/willow.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'January 2022',
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
    <section className="mx-auto max-w-7xl">
      <header>
        <img
          aria-hidden
          className="pb-8 not-sr-only sm:hidden"
          alt="frame"
          src="/images/svg/mobile-frame.svg"
        />
        <img
          aria-hidden
          className="hidden max-w-lg pb-8 not-sr-only lg:max-w-none sm:block"
          alt="frame"
          src="/images/svg/desktop-frame-5.svg"
        />
        <div className="flex items-center justify-between pl-1">
          <h1 className="heading">Explore Active Projects</h1>
          <div className="hidden gap-2 sm:flex">
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
      <div>
        <div className="flex flex-col gap-4 pt-12 sm:hidden">
          {UNLOCK_PROJECTS.slice(0, 3).map(
            ({ href, coverClass, title, published }, index) => (
              <Link key={index} href={href}>
                <div className="relative flex flex-col overflow-hidden h-60 group rounded-3xl">
                  <div
                    style={{
                      backgroundPosition: 'center',
                    }}
                    className={twMerge(
                      'object-cover h-full w-full absolute group-hover:transition-all',
                      coverClass
                    )}
                  >
                    <div className="absolute flex flex-col justify-end h-full p-8 text-white">
                      <time className="text-sm" dateTime={published}>
                        {published}
                      </time>
                      <h4 className="text-xl font-bold"> {title} </h4>
                    </div>
                  </div>
                </div>
              </Link>
            )
          )}
          <div className="text-center">
            <Link
              className="text-lg font-semibold text-brand-ui-primary"
              href="https://www.unlockshowcase.com/"
            >
              Check out more projects {'-->'}
            </Link>
          </div>
        </div>
        <div
          className="hidden w-full overflow-hidden cursor-move sm:block"
          ref={viewportRef}
        >
          <div className="flex gap-8 p-6 pt-12 ml-4 select-none">
            {UNLOCK_PROJECTS.map(
              ({ href, coverClass, title, text, published }, index) => {
                return (
                  <Link key={index} href={href}>
                    <div className="relative flex flex-col overflow-hidden w-[20rem] group h-[28rem] rounded-3xl">
                      <div
                        style={{
                          backgroundPosition: 'center',
                        }}
                        className={twMerge(
                          'object-cover h-full w-full absolute group-hover:transition-all',
                          coverClass
                        )}
                      >
                        <div className="absolute flex flex-col justify-end h-full p-8 text-white">
                          <time className="text-sm" dateTime={published}>
                            {published}
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
