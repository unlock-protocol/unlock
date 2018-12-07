import React from 'react'
import { Provider } from 'react-redux'
import renderer from 'react-test-renderer'
import withConfig from '../../../utils/withConfig'
import createUnlockStore from '../../../createUnlockStore'

const store = createUnlockStore({
  network: {
    name: 4,
  },
})

const Component = () => <div>An unlock component</div>

const ComponentWithConfig = withConfig(Component)

jest.mock('../../../config', () =>
  jest.fn().mockImplementation(() => {
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
        .create(
          <Provider store={store}>
            <ComponentWithConfig router={{ route: '/' }} />
          </Provider>
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
