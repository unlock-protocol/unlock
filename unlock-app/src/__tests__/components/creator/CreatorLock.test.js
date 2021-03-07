import React from 'react'
import * as rtl from '@testing-library/react'

import { CreatorLock } from '../../../components/creator/CreatorLock'
import configure from '../../../config'
import { UNLIMITED_KEYS_COUNT } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { AuthenticationContext } from '../../../components/interface/Authenticate'

const Web3ServiceProvider = Web3ServiceContext.Provider

export const renderWithContexts = (component) => {
  const config = {
    networks: {
      1492: {
        explorer: {
          urls: {
            address: () => '',
          },
        },
      },
    },
  }
  const authentication = { network: '1492' }
  return rtl.render(
    <Web3ServiceProvider value={web3Service}>
      <ConfigContext.Provider value={config}>
        <AuthenticationContext.Provider value={authentication}>
          {component}
        </AuthenticationContext.Provider>
      </ConfigContext.Provider>
    </Web3ServiceProvider>
  )
}

jest.mock('next/link', () => {
  return ({ children }) => children
})

const lock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '0.1',
  balance: '1',
  expirationDuration: 100,
}
const keylock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  outstandingKeys: 1,
  maxNumberOfKeys: 10,
  expirationDuration: 100,
}
const unlimitedlock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  outstandingKeys: 1,
  maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
  unlimitedKeys: true,
  expirationDuration: 100,
}

const transaction = {
  address: '0x0987654321',
  confirmations: 12,
  status: 'mined',
  lock: 'lockid',
}

const ConfigProvider = ConfigContext.Provider

const web3Service = {
  off: () => {},
}
describe('CreatorLock', () => {
  it('should show integration tab when the button is clicked', () => {
    expect.assertions(2)
    const wrapper = renderWithContexts(
      <CreatorLock lock={lock} updateLock={() => {}} />
    )

    expect(
      wrapper.queryByText('Easily integrate Unlock into your application', {
        exact: false,
      })
    ).toBeNull()

    const codeButton = wrapper.getByTitle('Integrations')
    rtl.fireEvent.click(codeButton)

    expect(
      wrapper.queryByText('Easily integrate Unlock into your application', {
        exact: false,
      })
    ).not.toBeNull()
  })

  it.skip('should open the edit form when the button is clicked', () => {
    expect.assertions(0)
    const wrapper = renderWithContexts(
      <CreatorLock lock={lock} updateLock={() => {}} />
    )

    const editButton = wrapper.getByTitle('Edit')
    rtl.fireEvent.click(editButton)

    wrapper.getByDisplayValue('0.1')
  })

  it('should display the correct number of keys', () => {
    expect.assertions(1)
    const wrapper = renderWithContexts(
      <CreatorLock lock={keylock} updateLock={() => {}} />
    )

    expect(wrapper.queryByText('1/10')).not.toBeNull()
  })

  it('should display infinite keys correctly', () => {
    expect.assertions(1)
    const wrapper = renderWithContexts(
      <CreatorLock lock={unlimitedlock} updateLock={() => {}} />
    )

    expect(wrapper.queryByText('1/∞')).not.toBeNull()
  })
})
