import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { MetadataForm } from '../../components/interface/MetadataForm'
import CheckoutWrapper from '../../components/checkout/CheckoutWrapper'

const onSubmit = event => console.log(event)

const fields = [
  {
    name: 'First Name',
    type: 'text',
    required: true,
  },
  {
    name: 'Last Name',
    type: 'text',
    required: true,
  },
  {
    name: 'Favorite Color',
    type: 'color',
    required: false,
  },
  {
    name: 'Birthdate',
    type: 'date',
    required: false,
  },
]

storiesOf('Metadata Collection Form', module)
  .addDecorator(getStory => (
    <CheckoutWrapper hideCheckout={() => action('hideCheckout')}>
      {getStory()}
    </CheckoutWrapper>
  ))
  .add('Empty', () => {
    return <MetadataForm fields={[]} onSubmit={onSubmit} />
  })
  .add('With Fields', () => {
    return <MetadataForm fields={fields} onSubmit={onSubmit} />
  })
