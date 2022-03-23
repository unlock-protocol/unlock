import type { AppProps } from 'next/app'
import { Provider } from '../components/helpers/Provider'
import '../styles/global.css'
import "../styles/prose.css"
import { DefaultSeo } from 'next-seo'
import { DEFAULT_SEO } from '../config/seo'
import { CookieBanner } from '../components/interface/CookieBanner'

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <CookieBanner />
      <DefaultSeo {...DEFAULT_SEO} />
      <Component {...pageProps} />
    </Provider>
  )
}

export default App
