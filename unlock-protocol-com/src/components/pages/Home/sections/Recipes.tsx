import {
  FaEthereum as EthereumIcon,
  FaWordpress as WordpressIcon,
} from 'react-icons/fa'
import { Link } from '../../../helpers/Link'
import { AirdropIcon, NFTTicketIcon } from '../../../icons/Util'
import useEmblaCarousel from 'embla-carousel-react'

export const UNLOCK_RECIPES = [
  {
    Icon: WordpressIcon,
    text: 'How to use the Ʉnlock WordPress plugin',
    href: 'https://docs.unlock-protocol.com/unlock/creators/plugins-and-integrations/wordpress-plugin',
  },
  {
    Icon: EthereumIcon,
    text: 'How to sign-in with Ethereum Wallet',
    href: 'https://docs.unlock-protocol.com/unlock/developers/sign-in-with-ethereum',
  },
  {
    Icon: NFTTicketIcon,
    text: 'How to build an NFT ticketing solution',
    href: 'https://docs.unlock-protocol.com/unlock/creators/tutorials-1/selling-tickets-for-an-event',
  },
  {
    Icon: AirdropIcon,
    text: 'How to airdrop memberships',
    href: 'https://docs.unlock-protocol.com/unlock/creators/tutorials-1/how-to-airdrop-memberships',
  },
]

export function Recipes() {
  const [viewportRef] = useEmblaCarousel({
    dragFree: true,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })
  return (
    <section className="max-w-6xl pt-6 pb-12 mx-auto">
      <header className="flex items-center justify-between px-6">
        <h2 className="text-xl font-bold sm:text-3xl"> Recipes </h2>
        <Link
          href="https://docs.unlock-protocol.com/unlock/creators/tutorials-1"
          className="text-sm font-medium uppercase text-brand-ui-primary sm:text-base"
        >
          Explore more recipes {'->'}
        </Link>
      </header>
      <div className="relative max-w-fit sm:px-6">
        <div className="overflow-hidden cursor-move" ref={viewportRef}>
          <div className="flex gap-8 p-8 ml-4 select-none">
            {UNLOCK_RECIPES.map(({ Icon, text, href }, index) => (
              <Link key={index} href={href}>
                <div className="flex flex-col justify-between p-6 w-72 h-52 glass-pane rounded-3xl">
                  <div>
                    <Icon className="fill-brand-ui-primary" size={48} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium"> {text}</h3>
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
