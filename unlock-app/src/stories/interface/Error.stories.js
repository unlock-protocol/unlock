import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Errors } from '../../components/interface/Errors'

const errors = ['error 1', 'error 2', 'error 3']

storiesOf('Errors', module)
  .add('Simple Error', () => {
    return (
      <Errors
        close={action('close')}
        errors={['We could not process that transaction.']}
      />
    )
  })
  .add('Multiple errors', () => {
    return <Errors errors={errors} close={action('close')} />
  })
