import React from 'react'
import { storiesOf } from '@storybook/react'
import { Errors } from '../../components/interface/Error'

const close = () => {}

const errors = ['error 1', 'error 2', 'error 3']

storiesOf('Error', module)
  .add('Simple Error', () => {
    return (
      <Errors close={close} error="We could not process that transaction." />
    )
  })
  .add('Multiple errors', () => {
    return <Errors errors={errors} close={close} />
  })
