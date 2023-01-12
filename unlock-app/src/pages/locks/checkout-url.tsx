import { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { CheckoutUrlPage } from '~/components/interface/locks/CheckoutUrl'

export const CheckoutUrl: NextPage = () => {
  return (
    <BrowserOnly>
      <AppLayout>
        <CheckoutUrlPage />
      </AppLayout>
    </BrowserOnly>
  )
}

export default CheckoutUrl
