import React from 'react'
import * as rtl from 'react-testing-library'

import { DeveloperOverlay } from '../../../components/developer/DeveloperOverlay'

describe('DeveloperOverlay', () => {
  const providers = ['HTML', 'Metamask']
  it('has a dropdown that can be used to choose between providers', () => {
    const component = rtl.render(<DeveloperOverlay providers={providers} />)

    expect(component.queryByText('HTML')).not.toBeNull()
    expect(component.queryByText('Metamask')).not.toBeNull()
  })

  it('sets selected provider from prop', () => {
    const component = rtl.render(
      <DeveloperOverlay providers={providers} selected="Metamask" />
    )

    expect(component.queryBySelectText('Metamask')).not.toBeNull()
  })
})
