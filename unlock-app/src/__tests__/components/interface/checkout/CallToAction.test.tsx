import React from 'react'
import * as rtl from '@testing-library/react'
import {
  CallToAction,
  defaultCallToAction,
} from '../../../../components/interface/checkout/CallToAction'
import { PaywallCallToAction } from '../../../../unlockTypes'

const callToAction = {
  noWallet: 'Hey, you need a wallet for this to work',
}

describe('CallToAction', () => {
  it('renders a loading message while the state is loading', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(<CallToAction state="loading" />)

    getByText('Loading...')
  })

  it('renders a message from the defaults when no cta object is provided', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(<CallToAction state="notLoggedIn" />)

    getByText(defaultCallToAction.noWallet)
  })

  it('renders a message from the cta object when provided', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <CallToAction
        state="notLoggedIn"
        callToAction={callToAction as PaywallCallToAction}
      />
    )

    getByText(callToAction.noWallet)
  })
})
