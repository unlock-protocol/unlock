import type { AppProps } from 'next/app'
import { Provider } from '../components/helpers/Provider'
import '../styles/global.css'
import '../styles/prose.css'
import { DefaultSeo } from 'next-seo'
import { DEFAULT_SEO } from '../config/seo'
import { CookieBanner } from '../components/interface/CookieBanner'
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Provider>
          <CookieBanner />
          <DefaultSeo {...DEFAULT_SEO} />
          <Component {...pageProps} />
        </Provider>
      </Hydrate>
    </QueryClientProvider>
  )
}

export default App
