import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Errors } from '../../components/interface/Errors'
import Error from '../../utils/Error'

const { Storage, Transaction } = Error

const errors = [
  Storage.Warning('error 1'),
  Storage.Warning('error 2'),
  Storage.Warning('error 3'),
]

storiesOf('Errors', module)
  .add('Simple Error', () => {
    return (
      <Errors
        close={action('close')}
        errors={[Transaction.Warning('We could not process that transaction.')]}
      />
    )
  })
  .add('Multiple errors', () => {
    return <Errors errors={errors} close={action('close')} />
  })
