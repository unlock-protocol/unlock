import React from 'react'
import renderer from 'react-test-renderer'
import { withConfig } from '../../../utils/withConfig'

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

describe('withConfig High Order Component', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(<ComponentWithConfig store={store} router={{ route: '/provider' }} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
