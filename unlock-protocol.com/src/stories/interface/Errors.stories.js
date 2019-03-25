import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Errors } from '../../components/interface/Errors'

const errors = [{ name: 'error 1' }, { name: 'error 2' }, { name: 'error 3' }]

storiesOf('Errors', module)
  .add('Simple Error', () => {
    return (
      <Errors
        close={action('close')}
        errors={[{ name: 'We could not process that transaction.' }]}
      />
    )
  })
  .add('Multiple errors', () => {
    return <Errors errors={errors} close={action('close')} />
  })
