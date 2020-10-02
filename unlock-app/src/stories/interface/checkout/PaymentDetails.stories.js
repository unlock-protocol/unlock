import React from 'react'
import { Provider } from 'react-redux'
import { storiesOf } from '@storybook/react'
import { PaymentDetails } from '../../../components/interface/checkout/PaymentDetails'
import { CheckoutContainer } from '../../../components/interface/checkout/CheckoutContainer'
import CheckoutWrapper from '../../../components/interface/checkout/CheckoutWrapper'
import { StorageServiceContext } from '../../../utils/withStorageService'
import { ConfigContext } from '../../../utils/withConfig'
import doNothing from '../../../utils/doNothing'
import createUnlockStore from '../../../createUnlockStore'

const store = createUnlockStore()
const config = {
  providers: [],
}

storiesOf('Checkout Payment Details', module)
  .addDecorator((getStory) => {
    return (
      <Provider store={store}>
        <StorageServiceContext.Provider value={{}}>
          <ConfigContext.Provider value={config}>
            <CheckoutContainer close={doNothing}>
              <CheckoutWrapper>{getStory()}</CheckoutWrapper>
            </CheckoutContainer>
          </ConfigContext.Provider>
        </StorageServiceContext.Provider>
      </Provider>
    )
  })
  .add('Payment Details', () => {
    return (
      <PaymentDetails
        invokePurchase={doNothing}
        setShowingPaymentForm={doNothing}
      />
    )
  })
