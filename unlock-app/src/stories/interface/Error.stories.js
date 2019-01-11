import React from 'react'
import { storiesOf } from '@storybook/react'
import { Error } from '../../components/interface/Error'
import { web3Error } from '../../actions/error'

const close = () => {}

storiesOf('Error', module)
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
          We could not process that transaction. <a href=".">Retry</a>.
        </p>
      </Error>
    )
  })
  .add('Web3 error', () => {
    const error = web3Error({ message: 'something went wrong' }).error
    return <Error close={close} error={error} />
  })
  .add('Web3 error (fr)', () => {
    const error = web3Error({ message: 'something went wrong' }).error
    return <Error close={close} error={error} locale="fr" />
  })
