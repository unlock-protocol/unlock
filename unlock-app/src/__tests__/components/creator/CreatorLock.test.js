import React from 'react'
import * as rtl from '@testing-library/react'
import { CreatorLock } from '../../../components/creator/CreatorLock'
import configure from '../../../config'
import { UNLIMITED_KEYS_COUNT } from '../../../constants'
import { ConfigContext } from '../../../utils/withConfig'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

const Web3ServiceProvider = Web3ServiceContext.Provider
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    }
  },
}))

export const renderWithContexts = (component) => {
  const config = {
    networks: {
      31337: {
        explorer: {
          urls: {
            address: () => '',
          },
        },
      },
    },
    services: {
      storage: {
        host: 'http://localhost:8080',
      },
    },
  }
  const authentication = { network: 31337 }
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
  network: 31337,
  publicLockVersion: 5,
}
const keylock = {
  address: '0x1234567890',
  transaction: 'transactionid',
  keyPrice: '1',
  balance: '1',
  outstandingKeys: 1,
  maxNumberOfKeys: 10,
  expirationDuration: 100,
  network: 31337,
  publicLockVersion: 5,
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
  network: 31337,
  publicLockVersion: 5,
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
      <CreatorLock network={31337} lock={lock} updateLock={() => {}} />
    )

    expect(
      wrapper.queryByText(
        'Easily integrate the lock into existing application through the use of plugins and bots',
        {
          exact: false,
        }
      )
    ).toBeNull()

    const codeButton = wrapper.getByTitle('Integrations')
    rtl.fireEvent.click(codeButton)

    expect(
      wrapper.queryByText(
        'Easily integrate the lock into existing application through the use of plugins and bots',
        {
          exact: false,
        }
      )
    ).not.toBeNull()
  })

  it.skip('should open the edit form when the button is clicked', () => {
    expect.assertions(0)
    const wrapper = renderWithContexts(
      <CreatorLock network={31337} lock={lock} updateLock={() => {}} />
    )

    const editButton = wrapper.getByTitle('Edit')
    rtl.fireEvent.click(editButton)

    wrapper.getByDisplayValue('0.1')
  })

  it('should display the correct number of keys', () => {
    expect.assertions(1)
    const wrapper = renderWithContexts(
      <CreatorLock network={31337} lock={keylock} updateLock={() => {}} />
    )

    expect(wrapper.queryByText('1/10')).not.toBeNull()
  })

  it('should display infinite keys correctly', () => {
    expect.assertions(1)
    const wrapper = renderWithContexts(
      <CreatorLock network={31337} lock={unlimitedlock} updateLock={() => {}} />
    )

    expect(wrapper.queryByText('1/∞')).not.toBeNull()
  })
})
