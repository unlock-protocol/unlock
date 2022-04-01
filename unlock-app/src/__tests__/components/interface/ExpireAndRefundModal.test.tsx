import React from 'react'
import * as rtl from '@testing-library/react'
import { OwnedKey } from '../../../components/interface/keychain/KeychainTypes'
import { ExpireAndRefundModal } from '../../../components/interface/ExpireAndRefundModal'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import { ConfigContext } from '../../../utils/withConfig'
import configure from '../../../config'
import {
  AuthenticationContext,
  defaultValues,
} from '../../../contexts/AuthenticationContext'
<<<<<<< HEAD
=======

<<<<<<< HEAD
process.on('unhandledRejection', (err) => console.trace(err))
>>>>>>> c9e20f35b (test updated)

=======
>>>>>>> 68d8f0132 (refactoring)
const aKey: OwnedKey = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  keyId: '1',
  tokenURI:
    'https://locksmith.unlock-protocol.com/api/key/0x80bc6d2870bb72cb3e37b648c160da20733386f7/1',

  lock: {
    address: '0xf8112a74d38f56e404282c3c5071eaaed0c29b40',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    price: '50',
    owner: '0x455375453031ac5fd7cf0e42291f2d8e3df67f85',
  },
}
const dismiss: jest.Mock<any, any> = jest.fn()

const renderWithContexts = (component: React.ReactElement<any>) => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
  //const account = '0x123'
>>>>>>> c9e20f35b (test updated)
=======
>>>>>>> 68d8f0132 (refactoring)
  const network = 1337
  const config = {
    networks: {
      1337: {
        explorer: {
          urls: {
            address: () => '',
          },
        },
      },
    },
  }

  const web3Service = {
    getAddressBalance: jest.fn(() => '123.45'),
  }

  const Web3ServiceContextProvider = Web3ServiceContext.Provider

  return rtl.render(
    <Web3ServiceContextProvider value={web3Service}>
      <ConfigContext.Provider value={config}>
        <AuthenticationContext.Provider value={{ ...defaultValues, network }}>
          {component}
        </AuthenticationContext.Provider>
      </ConfigContext.Provider>
    </Web3ServiceContextProvider>
  )
}

const modalActive: React.ReactElement<any> = (
  <ExpireAndRefundModal
    active
    dismiss={dismiss}
    lock={aKey.lock}
    lockAddresses={[aKey.lock.address]}
  />
)
const modalInactive: React.ReactElement<any> = (
  <ExpireAndRefundModal
    active
    dismiss={dismiss}
    lock={undefined}
    lockAddresses={[aKey.lock.address]}
  />
)

const mockWalletService = {
  getCancelAndRefundValueFor: jest.fn(),
}

const mockWeb3Service = {
  getTransaction: jest.fn(),
}

const config = configure()
describe('ExpireAndRefundModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      const networkId = 31337
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === AuthenticationContext) {
        return { network: networkId }
      }
      if (context === Web3ServiceContext) {
        return mockWeb3Service
      }
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === ConfigContext) {
        return config
      }
    })
  })
  it('correctly render ExpireAndRefund and have title', () => {
    expect.assertions(2)
    const { container, getByText } = renderWithContexts(modalActive)
    const title = getByText('Expire and Refund')
    expect(title).toBeDefined()
    expect(container).toBeDefined()
  })

  it('should show error if lock is not passaed as prop', () => {
    expect.assertions(1)
    const { getByText } = renderWithContexts(modalInactive)
    const message = getByText('No lock selected')
    expect(message).toBeDefined()
  })

  it('should call dismiss when CancelAndRefund confirmed', () => {
    expect.assertions(3)
    const { getByText } = renderWithContexts(modalActive)

    expect(dismiss).toBeCalledTimes(0)
    const confirmButton = getByText('Expire and Refund')
    expect(confirmButton).toBeDefined()
    rtl.fireEvent.click(confirmButton)
    expect(dismiss).toBeCalledTimes(1)
  })
})
