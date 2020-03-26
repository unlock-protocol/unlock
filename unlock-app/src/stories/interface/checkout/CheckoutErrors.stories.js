import React from 'react'
import { storiesOf } from '@storybook/react'
import { CheckoutErrors } from '../../../components/interface/checkout/CheckoutErrors'
import { CheckoutContainer } from '../../../components/interface/checkout/CheckoutContainer'
import CheckoutWrapper from '../../../components/interface/checkout/CheckoutWrapper'
import doNothing from '../../../utils/doNothing'

const fatalError = {
  level: 'Fatal',
  kind: 'Storage',
  message: 'Could not log in',
}

const warningError = {
  level: 'Warning',
  kind: 'Transaction',
  message: 'Something happened :c',
}

const diagnosticError = {
  level: 'Diagnostic',
  kind: 'FormValidation',
  message: 'That is not a great password',
}

storiesOf('Checkout Errors', module)
  .addDecorator(getStory => {
    return (
      <CheckoutContainer close={doNothing}>
        <CheckoutWrapper hideCheckout={doNothing} allowClose>
          {getStory()}
        </CheckoutWrapper>
      </CheckoutContainer>
    )
  })
  .add('No errors', () => {
    return <CheckoutErrors resetError={doNothing} errors={[]} />
  })
  .add('With errors', () => {
    return (
      <CheckoutErrors
        resetError={doNothing}
        errors={[fatalError, warningError, diagnosticError]}
      />
    )
  })
