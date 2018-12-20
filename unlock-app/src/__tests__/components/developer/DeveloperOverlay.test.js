import React from 'react'
import * as rtl from 'react-testing-library'

import { DeveloperOverlay } from '../../../components/developer/DeveloperOverlay'

describe('DeveloperOverlay', () => {
  it('has a dropdown that can be used to choose between providers', () => {
    const component = rtl.render(
      <DeveloperOverlay providers={['HTML', 'Metamask']} />
    )

    expect(component.getBySelectText('HTML'))
    expect(component.getBySelectText('Metamask'))
  })
})
