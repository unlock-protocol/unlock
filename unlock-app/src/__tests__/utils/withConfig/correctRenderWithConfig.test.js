import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import withConfig from '../../../utils/withConfig'
import createUnlockStore from '../../../createUnlockStore'

const store = createUnlockStore({
  account: {
    address: '0xdeadbeef',
    balance: '1000',
  },
  network: {
    name: 4,
  },
})

const Component = () => <div>An unlock component</div>

const ComponentWithConfig = withConfig(Component)

describe('withConfig High Order Component', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <ComponentWithConfig router={{ route: '/provider' }} />
        </Provider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
