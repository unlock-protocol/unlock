import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import ConnectedError, { Error, Errors } from '../../components/interface/Error'

import createUnlockStore from '../../createUnlockStore'

const close = () => {}

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
    return <Error close={close}>We could not process that transaction.</Error>
  })
  .add('Error with Markup', () => {
    return (
      <Error close={close}>
        We could not process that transaction. 
        {' '}
        <a href=".">Retry</a>
      </Error>
    )
  })
  .add('Errors', () => {
    return <Errors close={close} errors={manyErrors} />
  })
  .add('Errors (no errors)', () => {
    return <Errors close={close} errors={[]} />
  })
  .add('Error from redux store (dev)', () => {
    return <ConnectedError close={close} />
  })
  .add('Error from redux store (production)', () => {
    return <ConnectedError close={close} dev={false} />
  })
