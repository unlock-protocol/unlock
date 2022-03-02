import type { AppProps } from 'next/app'
import { Provider } from '../components/helpers/Provider'
import '../styles/global.css'
import { DefaultSeo } from 'next-seo'
import { DEFAULT_SEO } from '../config/seo'

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <DefaultSeo {...DEFAULT_SEO} />
      <Component {...pageProps} />
    </Provider>
  )
}

export default App
