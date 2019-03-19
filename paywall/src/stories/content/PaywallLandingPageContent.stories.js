import React from 'react'
import { Provider } from 'react-redux'

import { storiesOf } from '@storybook/react'
import PaywallLandingPageContent from '../../components/content/PaywallLandingPageContent'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore()

storiesOf('Paywall Landing Page', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('The Landing Page', () => {
    return <PaywallLandingPageContent />
  })
