import React from 'react'
import { storiesOf } from '@storybook/react'
import { Error } from '../../components/interface/Error'

storiesOf('Error', Error)
  .add('Simple Error', () => {
    return (
      <Error>
        <p>We could not process that transaction.</p>
      </Error>
    )
  })
  .add('Error with Markup', () => {
    return (
      <Error>
        <p>
We could not process that transaction.
          <a href=".">Retry</a>
.
        </p>
      </Error>
    )
  })
