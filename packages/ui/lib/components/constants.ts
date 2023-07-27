import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
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

export const DEFAULT_QUERY_CLIENT_OPTIONS = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 10,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          return ![400, 401, 403, 404].includes(error.response?.status || 0)
        }
        if (failureCount > 3) {
          return false
        }
        return true
      },
    },
  },
})
