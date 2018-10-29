import React from 'react'
import renderer from 'react-test-renderer'
import withConfig from '../../../utils/withConfig'

const state = {
  account: {
    address: '0xdeadbeef',
    balance: '1000',
  },
  network: {
    name: 4,
  },
}

const store = {
  getState: jest.fn(() => state),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
}

const Component = () =>
  <div>
    An unlock component
  </div>

const ComponentWithConfig = withConfig(Component)

jest.mock('../../../config', () => jest
  .fn()
  .mockImplementation(() => {
    return {
      providers: {
        HTTP: {},
      },
      isRequiredNetwork: () => false,
      requiredNetwork: 'dev',
    }
  })
)

describe('withConfig High Order Component', () => {
  describe('when the current network is not in the list of required networks', () => {
    it('should show a message indicating that the network needs to be changed', () => {
      const tree = renderer
        .create(<ComponentWithConfig store={store} router={{ route: '/' }} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
