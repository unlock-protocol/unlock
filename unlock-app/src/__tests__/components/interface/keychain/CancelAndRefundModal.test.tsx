import React from 'react'
import * as rtl from '@testing-library/react'
import { act, waitFor, screen } from '@testing-library/react'
import { CancelAndRefundModal } from '../../../../components/interface/keychain/CancelAndRefundModal'
import { OwnedKey } from '../../../../components/interface/keychain/KeychainTypes'
import { WalletServiceContext } from '../../../../utils/withWalletService'
import AuthenticationContext, {
  defaultValues,
} from '../../../../contexts/AuthenticationContext'
import { ConfigContext } from '../../../../utils/withConfig'
import { Web3ServiceContext } from '../../../../utils/withWeb3Service'

const accountAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
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
  const account = '0x123'
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
        <AuthenticationContext.Provider
          value={{ ...defaultValues, account, network }}
        >
          {component}
        </AuthenticationContext.Provider>
      </ConfigContext.Provider>
    </Web3ServiceContextProvider>
  )
}

const component: React.ReactElement<any> = (
  <CancelAndRefundModal
    active
    dismiss={dismiss}
    lock={aKey.lock}
    account={accountAddress}
    currency="eth"
  />
)

const componentInactive: React.ReactElement<any> = (
  <CancelAndRefundModal
    active
    dismiss={dismiss}
    lock={undefined}
    account={accountAddress}
    currency="eth"
  />
)

const mockWalletService = {
  getCancelAndRefundValueFor: jest.fn(),
}

describe('CancelAndRefundModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === WalletServiceContext) {
        return mockWalletService
      }
    })
  })
  it('correctly render CancelAndRefund', () => {
    expect.assertions(1)
    const { container } = renderWithContexts(component)
    expect(container).toBeDefined()
  })

  it('should show error if lock is not passaed as prop', () => {
    expect.assertions(1)
    const { getByText } = renderWithContexts(componentInactive)
    const message = getByText('No lock selected')
    expect(message).toBeDefined()
  })

  it('should call dismiss when CancelAndRefund confirmed', async () => {
    expect.assertions(5)
    const { container } = renderWithContexts(component)
    expect(await screen.findByText(/Cancel and Refund/i)).toBeInTheDocument()
    expect(dismiss).toBeCalledTimes(0)
    const confirmButton = container.querySelector('button') as HTMLElement
    expect(confirmButton).toBeDefined()
    await waitFor(() => expect(confirmButton).not.toBeDisabled(), {
      timeout: 5000,
    })
    act(async () => {
      rtl.fireEvent.click(confirmButton)
    })
    expect(dismiss).toBeCalledTimes(1)
  })
})
