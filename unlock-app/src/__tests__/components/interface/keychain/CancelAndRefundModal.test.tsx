import React from 'react'
import * as rtl from '@testing-library/react'
import { CancelAndRefundModal } from '../../../../components/interface/keychain/CancelAndRefundModal'
import { OwnedKey } from '../../../../components/interface/keychain/KeychainTypes'
import AuthenticationContext, {
  defaultValues,
} from '../../../../contexts/AuthenticationContext'
import { ConfigContext } from '../../../../utils/withConfig'
import { Web3ServiceContext } from '../../../../utils/withWeb3Service'
import { QueryClientProvider, QueryClient } from 'react-query'

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
const web3Service = {
  getAddressBalance: jest.fn(() => Promise.resolve('123.45')),
  transferFeeBasisPoints: jest.fn(() => Promise.resolve(0)),
  getCancelAndRefundValueFor: jest.fn(() => Promise.resolve(0.5)),
}

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

  const Web3ServiceContextProvider = Web3ServiceContext.Provider
  const queryClient = new QueryClient()

  return rtl.render(
    <QueryClientProvider client={queryClient}>
      <Web3ServiceContextProvider value={web3Service}>
        <ConfigContext.Provider value={config}>
          <AuthenticationContext.Provider
            value={{ ...defaultValues, account, network }}
          >
            {component}
          </AuthenticationContext.Provider>
        </ConfigContext.Provider>
      </Web3ServiceContextProvider>
    </QueryClientProvider>
  )
}

const component: React.ReactElement<any> = (
  <CancelAndRefundModal
    active
    setIsOpen={dismiss}
    lock={aKey.lock}
    account={accountAddress}
    currency="eth"
    keyId="1"
    network={4}
  />
)

const componentInactive: React.ReactElement<any> = (
  <CancelAndRefundModal
    active
    setIsOpen={dismiss}
    lock={undefined}
    account={accountAddress}
    currency="eth"
    keyId="1"
    network={4}
  />
)

const mockUseKeychain = {
  isLoading: true,
  data: {
    refundAmount: 2,
    transferFee: 0,
    lockBalance: 10,
  },
}

jest.mock('../../../../hooks/useKeychain', () => {
  return {
    useKeychain: jest.fn().mockResolvedValue(() => {
      return mockUseKeychain
    }),
  }
})

describe('CancelAndRefundModal', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('show loading', () => {
    expect.assertions(1)
    const { getByTestId } = renderWithContexts(component)

    expect(getByTestId('placeholder')).toBeDefined()
  })

  it.todo('it show refund message if refund is possible')

  it.todo('refund button is enabled when refund is possible')

  it.todo('it show refund error message when refund fee is 100%')

  it.todo('it show refund error message when balance cant cover the refund')

  it.todo('refund button is disabled when refund is not possible')

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
})
