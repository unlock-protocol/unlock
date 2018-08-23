import React from 'react'
import { shallow } from 'enzyme'
import App from '../App'
import NetworkBadge from '../components/interface/NetworkBadge'
import createRouterContext from 'react-router-test-context'
import createUnlockStore from '../createUnlockStore'
import PropTypes from 'prop-types'

// Mock the service
jest.mock('../services/web3Service', () => {
  return (function() {
    return {
      connect: () => {
        return new Promise((resolve, reject) => {
          return resolve()
        })
      },
    }
  })
})

it('renders without crashing', () => {
  shallow(<App />)
})

it('displays the correct network in the user interface when using MainLayout', () => {
  const context = createRouterContext({ location: { pathname: '/creator' } })
  context.store = createUnlockStore({defaultNetwork: 'dev'})
  const childContextTypes = {
    router: PropTypes.object,
    store: PropTypes.object,
  }

  const wrapper = shallow(<NetworkBadge />, { context, childContextTypes })
  expect(wrapper.contains(<div id="network" className="dev">Development</div>))
})
