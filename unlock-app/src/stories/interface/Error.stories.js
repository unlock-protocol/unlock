import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Provider } from 'react-redux'
import ConnectedError, { Error, Errors } from '../../components/interface/Error'

import createUnlockStore from '../../createUnlockStore'

const manyErrors = [
  {
    message: 'The blockchain may have made your head explode',
    context: 'Is too sexy',
  },
  {
    message: 'Secondary error',
    context: 'Thing',
  },
]

const store = createUnlockStore({
  errors: manyErrors,
})

storiesOf('Error', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Simple Error', () => {
    const close = action('close')
    return <Error close={close}>We could not process that transaction.</Error>
  })
  .add('Error with Markup', () => {
    const close = action('close')
    return (
      <Error close={close}>
        We could not process that transaction. 
        {' '}
        <a href=".">Retry</a>
      </Error>
    )
  })
  .add('Errors', () => {
    const close = action('close')
    return <Errors close={close} errors={manyErrors} />
  })
  .add('Errors (no errors)', () => {
    const close = action('close')
    return <Errors close={close} errors={[]} />
  })
  .add('Error from redux store (dev)', () => {
    return <ConnectedError />
  })
  .add('Error from redux store (production)', () => {
    return <ConnectedError dev={false} />
  })
