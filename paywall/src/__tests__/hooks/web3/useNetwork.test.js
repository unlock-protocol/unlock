import React from 'react'
import * as rtl from 'react-testing-library'
import PropTypes from 'prop-types'

import useNetwork from '../../../hooks/web3/useNetwork'
import { wrapperMaker } from '../helpers'
import { WalletContext } from '../../../hooks/components/Wallet'
import getNetwork from '../../../hooks/asyncActions/network'

jest.useFakeTimers()
jest.mock('../../../hooks/asyncActions/network')

describe('useNetwork hook', () => {
  let config
  let Wrapper
  let networkId
  const web3 = {
    eth: {
      net: {
        getId: () => networkId,
      },
    },
  }

  function MockNetwork({ noPoll = true }) {
    const network = useNetwork({ noPoll })
    return <div>{network}</div>
  }

  MockNetwork.propTypes = {
    noPoll: PropTypes.bool, // eslint-disable-line
  }

  beforeEach(() => {
    getNetwork.mockImplementation((handle, web3) => {
      handle(web3.eth.net.getId())
    })
    networkId = 4
    config = {
      requiredNetworkId: 4,
    }
    Wrapper = wrapperMaker(config)
  })

  it('returns default networkId', () => {
    const wrapper = rtl.render(
      <Wrapper>
        <WalletContext.Provider value={web3}>
          <MockNetwork />
        </WalletContext.Provider>
      </Wrapper>
    )

    expect(wrapper.getByText('4')).not.toBeNull()
  })

  it('updates networkId', () => {
    let wrapper

    networkId = 5
    rtl.act(() => {
      wrapper = rtl.render(
        <Wrapper>
          <WalletContext.Provider value={web3}>
            <MockNetwork />
          </WalletContext.Provider>
        </Wrapper>
      )
    })

    expect(wrapper.getByText('5')).not.toBeNull()
  })

  it('polls for changes to networkId', () => {
    let wrapper

    rtl.act(() => {
      wrapper = rtl.render(
        <Wrapper>
          <WalletContext.Provider value={web3}>
            <MockNetwork noPoll={false} />
          </WalletContext.Provider>
        </Wrapper>
      )
    })

    expect(wrapper.getByText('4')).not.toBeNull()

    rtl.act(() => {
      jest.runOnlyPendingTimers()
    })

    networkId = 6

    rtl.act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(wrapper.getByText('6')).not.toBeNull()
  })
})
