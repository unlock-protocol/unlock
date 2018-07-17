import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Network } from '../../components/Network'

const networks = {
  dev: {
    url: 'ws://127.0.0.1:8545',
    name: 'Development',
  },
  rinkeby: {
    url: 'https://rinkeby.infura.io/DP8aTF8zko71UQIAe1NV ',
    name: 'Rinkeby',
  },
}

describe('Network Component', () => {

  const network = {
    name: 'dev',
  }
  const setNetwork = jest.fn()
  const config = {
    networks,
  }

  const component = (<Network network={network} setNetwork={setNetwork} config={config} />)
  const wrapper = shallow(component)

  it('shows the network picker', () => {
    const options = wrapper.find('option')
    expect(options.at(0).equals(<option value="dev">
      Development
    </option>)).toEqual(true)
    expect(options.at(1).equals(<option value="rinkeby">
      Rinkeby
    </option>)).toEqual(true)
    expect(options).toHaveLength(2)
  })

  it('triggers a change in the store when a different network is picked', () => {
    wrapper.find('select').simulate('change', { target: { value: 'rinkeby' } })
    expect(setNetwork).toBeCalledWith('rinkeby')
    wrapper.find('select').simulate('change', { target: { value: 'dev' } })
    expect(setNetwork).toBeCalledWith('dev')
  })

})
