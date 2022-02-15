import {
  FaEthereum as EthereumIcon,
  FaWordpress as WordpressIcon,
} from 'react-icons/fa'
import { Link } from '../../../helpers/Link'
import { AirdropIcon, NFTTicketIcon } from '../../../icons/Util'

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
  return (
    <div className="space-y-2">
      <header className="flex justify-between">
        <h2 className="font-bold text-xl sm:text-3xl"> Recipes </h2>
        <Link> Explore more recipes </Link>
      </header>
      <div className="flex gap-6 py-6 overflow-x-scroll max-w-xs md:max-w-4xl lg:max-w-screen-lg">
        {UNLOCK_RECIPES.map(({ Icon, text, href }, index) => (
          <Link key={index} href={href}>
            <div className="glass-pane rounded-3xl p-6 flex flex-col h-48 w-64 justify-between">
              <div>
                <Icon className="fill-brand-ui-primary" size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium"> {text}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
