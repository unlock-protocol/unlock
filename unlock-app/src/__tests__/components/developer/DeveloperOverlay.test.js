import React from 'react'
import * as rtl from 'react-testing-library'

import {
  DeveloperOverlay,
  mapStateToProps,
} from '../../../components/developer/DeveloperOverlay'

jest.mock('../../../config.js', () => {
  const ret = () => ({
    env: 'dev',
    isRequiredNetwork: () => false,
    isServer: false,
    providers: {
      HTTP: {},
      Metamask: {},
      Opera: {},
    },
    requiredNetwork: 'Dev',
    requiredConfirmations: 12,
  })
  return ret
})

const config = {
  env: 'dev',
  isRequiredNetwork: () => false,
  isServer: false,
  providers: {
    HTTP: {},
    Metamask: {},
    Opera: {},
  },
}

describe('DeveloperOverlay', () => {
  let callback
  beforeEach(() => {
    callback = jest.fn()
  })

  it('has a dropdown that can be used to choose between providers', () => {
    expect.assertions(2)
    const component = rtl.render(
      <DeveloperOverlay config={config} setProvider={callback} />
    )

    expect(component.queryByText('HTTP')).not.toBeNull()
    expect(component.queryByText('Metamask')).not.toBeNull()
  })

  it('sets selected provider from prop', () => {
    expect.assertions(1)
    const component = rtl.render(
      <DeveloperOverlay
        config={config}
        selected="Metamask"
        setProvider={callback}
      />
    )

    expect(component.queryBySelectText('Metamask')).not.toBeNull()
  })

  it('selects provider', () => {
    expect.assertions(2)
    const component = rtl.render(
      <DeveloperOverlay
        config={config}
        selected="Metamask"
        setProvider={callback}
      />
    )
    expect(component.queryBySelectText('Metamask')).not.toBeNull()

    rtl.fireEvent.change(component.getBySelectText('Metamask'), {
      target: { value: 'HTTP' },
    })
    expect(callback).toHaveBeenCalledWith('HTTP')
  })

  it('mapStateToProps', () => {
    expect.assertions(1)
    expect(
      mapStateToProps({
        provider: 'hi',
      })
    ).toEqual({ selected: 'hi' })
  })
})
