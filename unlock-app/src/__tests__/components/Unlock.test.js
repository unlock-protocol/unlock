import createRouterContext from 'react-router-test-context'
import createUnlockStore from '../../createUnlockStore'
import PropTypes from 'prop-types'
import React from 'react'
import { mount, shallow } from 'enzyme'
import { Unlock } from '../../components/Unlock'

// Mock the service
jest.mock('../../services/web3Service', () => {
  return (function () {
    return {
      connect: () => {
        return new Promise((resolve, reject) => {
          return resolve()
        })
      },
    }
  })
})

/**
 * TODO: unskip tests when https://github.com/airbnb/enzyme/issues/1509 has been published...
 */
describe.skip('Unlock Component', () => {

  describe('when Metanask is not required', () => {

    it('shows the home page when going to /', () => {
      const context = createRouterContext({ location: { pathname: '/' } })
      context.store = createUnlockStore('dev')
      const component = (<Unlock />)
      const childContextTypes = {
        router: PropTypes.object,
        store: PropTypes.object,
      }

      const wrapper = mount(component, { context, childContextTypes })
      expect(wrapper.find('Home')).toExist()
    })

    it('shows the creators interface if the route matches /creator', () => {
      const context = createRouterContext({ location: { pathname: '/creator' } })
      context.store = createUnlockStore('dev')
      const component = (<Unlock />)
      const childContextTypes = {
        router: PropTypes.object,
        store: PropTypes.object,
      }

      const wrapper = mount(component, { context, childContextTypes })
      expect(wrapper.find('LockMaker')).toExist()
    })

    it('shows the lock consumer interface if the route matches /lock/:lockAddress', () => {
      const context = createRouterContext({ location: { pathname: '/lock/0xE3984638f8E8647D4603A4D42370EBe7463720Ec' } })
      context.store = createUnlockStore('dev')
      const component = (<Unlock />)
      const childContextTypes = {
        router: PropTypes.object,
        store: PropTypes.object,
      }
      const wrapper = mount(component, { context, childContextTypes })
      expect(wrapper.find('Lock')).toExist()
    })
  })

  describe('when Metamask is required', () => {
    describe('when Metamask is present', () => {
      it('shows the home page when going to /', () => {
        const context = createRouterContext({ location: { pathname: '/' } })
        context.store = createUnlockStore('dev')
        const component = (<Unlock web3Available={true} />)
        const childContextTypes = {
          router: PropTypes.object,
          store: PropTypes.object,
        }

        const wrapper = mount(component, { context, childContextTypes })
        expect(wrapper.find('Home')).toExist()
      })

      it('shows the creators interface if the route matches /creator', () => {
        const context = createRouterContext({ location: { pathname: '/creator' } })
        context.store = createUnlockStore('dev')
        const component = (<Unlock web3Available={true} />)
        const childContextTypes = {
          router: PropTypes.object,
          store: PropTypes.object,
        }

        const wrapper = mount(component, { context, childContextTypes })
        expect(wrapper.find('LockMaker')).toExist()
      })

      it('shows the lock consumer interface if the route matches /lock/:lockAddress', () => {
        const context = createRouterContext({ location: { pathname: '/lock/0xE3984638f8E8647D4603A4D42370EBe7463720Ec' } })
        context.store = createUnlockStore('dev')
        const component = (<Unlock web3Available={true} />)
        const childContextTypes = {
          router: PropTypes.object,
          store: PropTypes.object,
        }
        const wrapper = mount(component, { context, childContextTypes })
        expect(wrapper.find('Lock')).toExist()
      })
    })

    describe('when Metamask is missing', () => {
      it('shows a modal asking for Metamask for any route', () => {
        const component = (<Unlock web3Available={false} />)
        const wrapper = shallow(component)
        expect(wrapper.find('h5').text()).toEqual('Metamask is required')
      })
    })

  })

})