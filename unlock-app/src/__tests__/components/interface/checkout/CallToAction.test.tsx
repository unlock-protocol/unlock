import React from 'react'
import * as rtl from '@testing-library/react'
import {
  CallToAction,
  defaultCallToAction,
} from '../../../../components/interface/checkout/CallToAction'
import { PaywallCallToAction } from '../../../../unlockTypes'

const callToAction = {
  noWallet: 'Hey, you need a wallet for this to work',
  metadata: 'We need to collect some additional information for your purchase.',
}

describe('CallToAction', () => {
  it.skip('renders a loading message while the state is loading', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(<CallToAction state="loading" />)

    getByText('Loading...')
  })

  it.skip('renders a message from the defaults when no cta object is provided', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(<CallToAction state="notLoggedIn" />)

    getByText(defaultCallToAction.noWallet)
  })

  it.skip('renders a message from the cta object when provided', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <CallToAction
        state="notLoggedIn"
        callToAction={callToAction as PaywallCallToAction}
      />
    )

    getByText(callToAction.noWallet)
  })

  it.skip('renders a message from the cta object when provided when in the metadata stare', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <CallToAction
        state="metadataForm"
        callToAction={callToAction as PaywallCallToAction}
      />
    )

    getByText(callToAction.metadata)
  })
})
