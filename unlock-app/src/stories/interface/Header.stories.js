import React from 'react'
import { Provider } from 'react-redux'
import { storiesOf } from '@storybook/react'
import Header from '../../components/interface/Header'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  router: {
    location: {
      pathname: '',
    },
  },
})

storiesOf('Header', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('the header without a title', () => {
    return <Header />
  })
  .add('the header with a title', () => {
    return <Header title="Roses are red" />
  })
  .add('the header for a content page', () => {
    return <Header forContent title="Roses are red" />
  })
