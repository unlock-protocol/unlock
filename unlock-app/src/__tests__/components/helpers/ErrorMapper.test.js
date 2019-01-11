import * as rtl from 'react-testing-library'
import React from 'react'

import { ErrorMapper } from '../../../components/helpers/ErrorMapper'
import { web3Error } from '../../../actions/error'

describe('ErrorMapper', () => {
  it('maps web3 errors to the en error message', () => {
    const error = web3Error({ message: 'error' }).error

    const component = rtl.render(<ErrorMapper error={error} locale="en" />)
    expect(component.queryByText('Web3 error: error')).not.toBeNull()
  })
  it('maps web3 errors to the fr error message', () => {
    const error = web3Error({ message: 'error' }).error

    const component = rtl.render(<ErrorMapper error={error} locale="fr" />)
    expect(component.queryByText('Web3 erreur: error')).not.toBeNull()
  })
})
