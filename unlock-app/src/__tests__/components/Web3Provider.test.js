import React from 'react'
import * as rtl from '@testing-library/react'
// Note, we use name import to import the non connected version of the component for testing
import { Web3Provider } from '../../components/Web3Provider'

const providers = {
  alpha: {},
  beta: {},
  gamma: {},
}

describe('Provider Component', () => {
  const provider = 'alpha'
  const setProvider = jest.fn()
  const config = {
    providers,
  }

  let component
  let wrapper
  let select

  beforeEach(() => {
    component = (
      <Web3Provider
        provider={provider}
        setProvider={setProvider}
        config={config}
      />
    )
    wrapper = rtl.render(component)
    select = wrapper.queryBySelectText(provider)
  })

  it('shows the provider picker', () => {
    expect.assertions(4)
    const options = select.querySelectorAll('option')

    expect(options).toHaveLength(3)

    expect(wrapper.getByText('alpha').value).toBe('alpha')
    expect(wrapper.getByText('beta').value).toBe('beta')
    expect(wrapper.getByText('gamma').value).toBe('gamma')
  })

  it('triggers a change in the store when a different provider is picked', () => {
    expect.assertions(3)
    select.value = 'beta'
    rtl.fireEvent.change(select)

    expect(setProvider).toBeCalledWith('beta')

    select.value = 'gamma'
    rtl.fireEvent.change(select)

    expect(setProvider).toBeCalledWith('gamma')

    select.value = 'alpha'
    rtl.fireEvent.change(select)

    expect(setProvider).toBeCalledWith('alpha')
  })
})
