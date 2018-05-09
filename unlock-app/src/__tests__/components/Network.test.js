import React from 'react'
import { shallow } from 'enzyme'
// Note, we use name import to import the non connected version of the component for testing
import { Network } from '../../components/Network'

describe('Network Component', () => {

  const network = 'dev'
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
  const setNetwork = jest.fn()

  const component = (<Network network={network} networks={networks} setNetwork={setNetwork} />)
  const wrapper = shallow(component)

  it('shows the network picker', () => {
    const options = wrapper.find('option')
    expect(options).toHaveLength(2)
    expect(options.at(0).equals(<option value="dev">
      Development
    </option>)).toEqual(true)
    expect(options.at(1).equals(<option value="rinkeby">
      Rinkeby
    </option>)).toEqual(true)
  })

  it('invokes triggers the purchase action when the purchase button is clicked', () => {
    wrapper.find('input').simulate('change', { target: { value: 'rinkeby' } })
    expect(setNetwork).toBeCalledWith('rinkeby')
    wrapper.find('input').simulate('change', { target: { value: 'dev' } })
    expect(setNetwork).toBeCalledWith('dev')
  })

})
