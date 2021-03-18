import React from 'react'
import { storiesOf } from '@storybook/react'
import { MetadataForm } from '../../../components/interface/checkout/MetadataForm'
import { CheckoutContainer } from '../../../components/interface/checkout/CheckoutContainer'
import CheckoutWrapper from '../../../components/interface/checkout/CheckoutWrapper'
import doNothing from '../../../utils/doNothing'

const metadataInputs = [
  {
    name: 'First Name',
    type: 'text',
    required: true,
    public: true,
  },
  {
    name: 'Last Name',
    type: 'text',
    required: true,
  },
]

storiesOf('Checkout Metadata Form', module)
  .addDecorator((getStory) => {
    return (
      <CheckoutContainer close={doNothing}>
        <CheckoutWrapper hideCheckout={doNothing} allowClose>
          {getStory()}
        </CheckoutWrapper>
      </CheckoutContainer>
    )
  })
  .add('Basic', () => {
    return <MetadataForm fields={metadataInputs} onSubmit={doNothing} />
  })
  .add('With a default value', () => {
    const metadataInputsWithDefault = [
      ...metadataInputs,
      {
        name: 'Email',
        defaultValue: 'hello@unlock-protocol.com',
        type: 'text',
        required: true,
        public: true,
      },
    ]
    return (
      <MetadataForm
        fields={metadataInputsWithDefault}
        onSubmit={(args) => {}}
      />
    )
  })
