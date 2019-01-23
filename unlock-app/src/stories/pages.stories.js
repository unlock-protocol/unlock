import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'

import Home from '../pages'
import About from '../pages/about'
import Jobs from '../pages/jobs'
import Terms from '../pages/terms'
import Privacy from '../pages/privacy'
import createUnlockStore from '../createUnlockStore'

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

storiesOf('Content pages', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the Home page', () => {
    return <Home />
  })
  .add('the About page', () => {
    return <About />
  })
  .add('the Jobs page', () => {
    return <Jobs />
  })
  .add('the Terms of Service page', () => {
    return <Terms />
  })
  .add('the Privacy Policy page', () => {
    return <Privacy />
  })
