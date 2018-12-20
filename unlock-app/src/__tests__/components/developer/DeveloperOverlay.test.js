import React from 'react'
import * as rtl from 'react-testing-library'
import createUnlockStore from '../../../createUnlockStore'

import { DeveloperOverlay } from '../../../components/developer/DeveloperOverlay'

describe('DeveloperOverlay', () => {
  let config
  let callback
  beforeEach(() => {
    callback = jest.fn()
    config = {
      env: 'dev',
      isRequiredNetwork: () => false,
      isServer: false,
      providers: {
        HTTP: {},
        Metamask: {},
        Opera: {},
      },
    }
  })

  it('has a dropdown that can be used to choose between providers', () => {
    const component = rtl.render(
      <DeveloperOverlay config={config} selectProvider={callback} />
    )

    expect(component.queryByText('HTTP')).not.toBeNull()
    expect(component.queryByText('Metamask')).not.toBeNull()
  })

  it('sets selected provider from prop', () => {
    const component = rtl.render(
      <DeveloperOverlay
        config={config}
        selected="Metamask"
        selectProvider={callback}
      />
    )

    expect(component.queryBySelectText('Metamask')).not.toBeNull()
  })

  it('selects provider', async () => {
    const component = rtl.render(
      <DeveloperOverlay
        config={config}
        selected="Metamask"
        selectProvider={callback}
      />
    )
    expect(component.queryBySelectText('Metamask')).not.toBeNull()

    rtl.fireEvent.change(component.getBySelectText('Metamask'), {
      target: { value: 'HTTP' },
    })
    expect(callback).toHaveBeenCalledWith('HTTP')
  })

  describe('connected overlay', () => {
    let store

    beforeEach(() => {
      store = createUnlockStore({
        provider: 'HTTP',
      })
      config = {
        env: 'dev',
        isRequiredNetwork: () => false,
        isServer: false,
        providers: {
          HTTP: {},
          Metamask: {},
          Opera: {},
        },
      }
    })

    it('with actual config', () => {})
  })
})
