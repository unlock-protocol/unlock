import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import ConnectedError, { Error } from '../../components/interface/Error'

import createUnlockStore from '../../createUnlockStore'

const close = () => {}

const store = createUnlockStore({
  error: {
    message: 'The blockchain may have made your head explode',
    context: 'Context',
  },
})

storiesOf('Error', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Simple Error', () => {
    return (
      <Error close={close}>
        <p>We could not process that transaction.</p>
      </Error>
    )
  })
  .add('Error with Markup', () => {
    return (
      <Error close={close}>
        <p>
          We could not process that transaction. 
          {' '}
          <a href=".">Retry</a>
.
        </p>
      </Error>
    )
  })
  .add('Error from redux store (dev)', () => {
    return <ConnectedError close={close} />
  })
  .add('Error from redux store (production)', () => {
    return <ConnectedError close={close} dev={false} />
  })
