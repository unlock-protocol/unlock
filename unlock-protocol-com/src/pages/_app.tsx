import type { AppProps } from 'next/app'
import { Provider } from '../components/helpers/Provider'
import '../styles/global.css'
import '../styles/prose.css'
import { DefaultSeo } from 'next-seo'
import { DEFAULT_SEO } from '../config/seo'
import { CookieBanner } from '../components/interface/CookieBanner'
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  DehydratedState,
} from 'react-query'
import { UnlockUIProvider } from '@unlock-protocol/ui'
import NextLink from 'next/link'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
function App({
  Component,
  pageProps,
}: AppProps<{ dehydratedState: DehydratedState }>) {
  return (
    <UnlockUIProvider Link={NextLink}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Provider>
            <CookieBanner />
            <DefaultSeo {...DEFAULT_SEO} />
            <Component {...pageProps} />
          </Provider>
        </Hydrate>
      </QueryClientProvider>
    </UnlockUIProvider>
  )
}

export default App
