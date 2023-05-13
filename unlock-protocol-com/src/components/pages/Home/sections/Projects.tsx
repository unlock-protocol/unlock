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
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/blockworks.png)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/blockworks.png)] [background-blend-mode:normal,screen,normal]',
    published: 'May 2023',
    title: 'Blockworks',
    text: 'The Myth of Immutability',
    href: 'https://blockworks.co/news/blockchains-are-not-immutable',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/cointelegraph.png)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/cointelegraph.png)] [background-blend-mode:normal,screen,normal]',
    published: 'March 2023',
    title: 'Cointelegraph',
    text: "Why Didn't Crypto Walk the Walk at ETHDenver?",
    href: 'https://cointelegraph.com/news/why-didn-t-crypto-walk-the-walk-at-ethdenver/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/torquelogo.png)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/torquelogo.png)] [background-blend-mode:normal,screen,normal]',
    published: 'March 2023',
    title: 'Torque Magazine',
    text: 'What is the Creator Economy (And How Can You Join It?)',
    href: 'https://torquemag.io/2023/03/creator-economy/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/socialmediaexaminer.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/socialmediaexaminer.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'January 2023',
    title: 'Social Media Examiner',
    text: 'Web3 Business Trends for 2023: Predictions From the Pros',
    href: 'https://www.socialmediaexaminer.com/web3-business-trends-for-2023-predictions-from-the-pros/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/wired.png)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/wired.png)] [background-blend-mode:normal,screen,normal]',
    published: 'May 2022',
    title: 'Wired',
    text: 'Inside the Web3 Revolution',
    href: 'https://www.wired.com/story/web3-paradise-crypto-arcade/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/coindesk.jpg)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/coindesk.jpg)] [background-blend-mode:normal,screen,normal]',
    published: 'April 2022',
    title: 'Coindesk',
    text: 'NFT Subscriptions are Better Paywalls',
    href: 'https://www.coindesk.com/layer2/paymentsweek/2022/04/28/nft-subscriptions-are-better-paywalls/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/techcrunch.png)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/techcrunch.png)] [background-blend-mode:normal,screen,normal]',
    published: 'September 2021',
    title: 'TechCrunch',
    text: 'Guardian Owner Invests in Unlock',
    href: 'https://techcrunch.com/2021/09/28/guardian-owner-invests-in-unlock-an-nft-protocol-designed-for-subscriptions-and-memberships/',
  },
  {
    coverClass:
      '[background:linear-gradient(180deg,rgba(96,61,235,0)_39.58%,#3F17DE_100%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/forbes.png)] group-hover:[background:linear-gradient(180deg,rgba(96,61,235,0)_0%,#3F17DE_75%),linear-gradient(180deg,#A08BF3_0%,#603DEB_100%),url(/images/marketing/projects/forbes.png)] [background-blend-mode:normal,screen,normal]',
    published: 'December 2019',
    title: 'Forbes',
    text: 'Forbes Experiments With Paywall Solution Unlock Protocol',
    href: 'https://cryptomode.com/forbes-experiments-with-crypto-paywall-solution-unlock-protocol/',
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
          <h1 className="heading">Unlock in the news</h1>
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
