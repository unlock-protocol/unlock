import React, { useContext } from 'react'
import * as rtl from 'react-testing-library'
import PropTypes from 'prop-types'

import walletService from '../../../services/walletService'
import WalletServiceProvider, {
  WalletServiceContext,
  WalletStateContext,
} from '../../../hooks/components/WalletServiceProvider'
import { ConfigContext } from '../../../hooks/utils/useConfig'
import { expectError, wrapperMaker } from '../helpers'

jest.mock('../../../services/walletService')
describe('WalletService component', () => {
  let callbacks
  let config
  let wallet
  let connect
  let on

  beforeEach(() => {
    callbacks = {}
    config = { requiredNetworkId: 1 }
    on = jest.fn((type, callback) => (callbacks[type] = callback))
    connect = jest.fn()
    walletService.mockImplementation(() => ({
      on,
      connect,
    }))
  })

  function WalletConsumerInternal() {
    const walletService = useContext(WalletServiceContext)
    const walletState = useContext(WalletStateContext)
    wallet = walletService
    return (
      <div>
        {Object.keys(walletState).map(key => (
          <span title={key} key={key}>
            {JSON.stringify(walletState[key])}
          </span>
        ))}
        <span title="walletService">
          {walletService ? 'ready' : 'not ready'}
        </span>
      </div>
    )
  }

  function MockWalletConsumer({ noPoll = false }) {
    return (
      <ConfigContext.Provider value={config}>
        <WalletServiceProvider noPoll={noPoll}>
          <WalletConsumerInternal />
        </WalletServiceProvider>
      </ConfigContext.Provider>
    )
  }

  MockWalletConsumer.propTypes = {
    noPoll: PropTypes.bool,
  }

  MockWalletConsumer.defaultProps = {
    noPoll: false,
  }

  describe('initialization', () => {
    it('creates a new walletService and calls connect', () => {
      rtl.render(<MockWalletConsumer />)

      expect(wallet).toBeNull()
      expect(connect).toHaveBeenCalled()
    })
    it('sets up the event listeners', () => {
      rtl.render(<MockWalletConsumer />)

      expect(on).toHaveBeenCalledTimes(4)
      expect(on).toHaveBeenNthCalledWith(1, 'ready', expect.any(Function))

      expect(on).toHaveBeenNthCalledWith(
        2,
        'account.changed',
        expect.any(Function)
      )
      expect(on).toHaveBeenNthCalledWith(
        3,
        'network.changed',
        expect.any(Function)
      )
      expect(on).toHaveBeenNthCalledWith(4, 'error', expect.any(Function))
    })
  })
  describe('event listeners', () => {
    function getCallback(type) {
      switch (type) {
        case 'ready':
          return on.mock.calls[0][1]
        case 'account.changed':
          return on.mock.calls[1][1]
        case 'network.changed':
          return on.mock.calls[2][1]
        case 'error':
          return on.mock.calls[3][1]
      }
    }

    it('initializes the wallet when ready', () => {
      const wrapper = rtl.render(<MockWalletConsumer />)

      const ready = getCallback('ready')
      rtl.act(() => {
        ready()
      })

      expect(wallet).not.toBeNull()
      expect(wrapper.getByTitle('ready')).toHaveTextContent('true')
    })

    it('responds to account.changed', () => {
      const wrapper = rtl.render(<MockWalletConsumer />)

      const changedAccount = getCallback('account.changed')
      rtl.act(() => {
        changedAccount('new account')
      })

      expect(wrapper.getByTitle('account')).toHaveTextContent('new account')
    })
    it('responds to network.changed', () => {
      const wrapper = rtl.render(<MockWalletConsumer />)

      expect(wrapper.getByTitle('network')).toHaveTextContent('1')
      const changedNetwork = getCallback('network.changed')
      rtl.act(() => {
        changedNetwork(3)
      })

      expect(wrapper.getByTitle('network')).toHaveTextContent('3')
    })
    it('throws on receiving error', () => {
      const Wrapper = wrapperMaker(config)
      expectError(() => {
        rtl.render(
          <Wrapper>
            <MockWalletConsumer />
          </Wrapper>
        )

        const error = getCallback('error')
        rtl.act(() => {
          error(new Error('nope'))
        })
      }, 'nope')
    })
  })
})
