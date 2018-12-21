import React from 'react'
import { storiesOf } from '@storybook/react'
import { Error } from '../../components/interface/Error'

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
          We could not process that transaction. 
          {' '}
          <a href=".">Retry</a>
.
        </p>
      </Error>
    )
  })
