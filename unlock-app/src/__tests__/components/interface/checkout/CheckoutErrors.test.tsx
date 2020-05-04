import React from 'react'
import * as rtl from '@testing-library/react'
import {
  CheckoutErrors,
  genericError,
} from '../../../../components/interface/checkout/CheckoutErrors'
import { UnlockError } from '../../../../utils/Error'

const fatalUnknowError: UnlockError = {
  level: 'Fatal',
  kind: 'Storage',
  message: '',
}

const fatalError: UnlockError = {
  level: 'Fatal',
  kind: 'Storage',
  message: 'Could not log in',
}

const warningError: UnlockError = {
  level: 'Warning',
  kind: 'Transaction',
  message: 'Something happened :c',
}

const diagnosticError: UnlockError = {
  level: 'Diagnostic',
  kind: 'FormValidation',
  message: 'That is not a great password',
}

const errors = [fatalUnknowError, fatalError, warningError, diagnosticError]
let resetError: jest.Mock<any, any>
describe('Checkout Errors', () => {
  beforeEach(() => {
    resetError = jest.fn()
  })

  it('renders', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <CheckoutErrors errors={errors} resetError={resetError} />
    )

    getByText(genericError)
    getByText(fatalError.message)
    getByText(warningError.message)
    getByText(diagnosticError.message)
  })

  it('resets the appropriate error on click', () => {
    expect.assertions(1)

    const { getByText } = rtl.render(
      <CheckoutErrors errors={errors} resetError={resetError} />
    )

    const warning = getByText(warningError.message)
    rtl.fireEvent.click(warning)

    expect(resetError).toHaveBeenCalledWith(warningError)
  })
})
