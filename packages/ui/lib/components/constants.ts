import { IconType } from 'react-icons'
import {
  BsGithub as GithubIcon,
  BsDiscord as DiscordIcon,
  BsTwitter as TwitterIcon,
} from 'react-icons/bs'
interface SocialLinkProps {
  url: string
  icon: IconType
}

export const SOCIAL_LINKS: SocialLinkProps[] = [
  {
    url: 'https://github.com/unlock-protocol',
    icon: GithubIcon,
  },
  {
    url: 'https://discord.com/invite/Ah6ZEJyTDp',
    icon: DiscordIcon,
  },
  {
    url: 'https://twitter.com/UnlockProtocol',
    icon: TwitterIcon,
  },
]
