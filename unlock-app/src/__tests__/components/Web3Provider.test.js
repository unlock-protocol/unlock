import React from 'react'
import { shallow } from 'enzyme'
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

  const component = (<Web3Provider provider={provider} setProvider={setProvider} config={config} />)
  const wrapper = shallow(component)

  it('shows the provider picker', () => {
    const options = wrapper.find('option')

    expect(options.at(0).equals(<option value="alpha">
      alpha
    </option>)).toEqual(true)
    expect(options.at(1).equals(<option value="beta">
      beta
    </option>)).toEqual(true)
    expect(options.at(2).equals(<option value="gamma">
      gamma
    </option>)).toEqual(true)
    expect(options).toHaveLength(3)
  })

  it('triggers a change in the store when a different provider is picked', () => {
    wrapper.find('select').simulate('change', { target: { value: 'beta' } })
    expect(setProvider).toBeCalledWith('beta')
    wrapper.find('select').simulate('change', { target: { value: 'gamma' } })
    expect(setProvider).toBeCalledWith('gamma')
    wrapper.find('select').simulate('change', { target: { value: 'alpha' } })
    expect(setProvider).toBeCalledWith('alpha')
  })

})
