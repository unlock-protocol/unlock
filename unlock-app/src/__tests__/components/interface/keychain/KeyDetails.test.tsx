import React from 'react'
import * as rtl from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/react-testing'
import { KeyDetails } from '../../../../components/interface/keychain/KeyDetails'
import { OwnedKey } from '../../../../components/interface/keychain/KeychainTypes'
import keyHolderQuery from '../../../../queries/keyHolder'

const accountAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const aKey: OwnedKey = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  keyId: '1',
  tokenURI:
    'https://locksmith.unlock-protocol.com/api/key/0x80bc6d2870bb72cb3e37b648c160da20733386f7/1',

  lock: {
    address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0xbadc0ffee',
    price: '50',
    owner: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
  },
}

const render = (...mocks: MockedResponse[]) => {
  return rtl.render(
    <MockedProvider mocks={mocks || []} addTypename={false}>
      <KeyDetails />
    </MockedProvider>
  )
}

describe.skip('keychain -- KeyDetails', () => {
  it('should render loading state', () => {
    expect.assertions(0)

    const { getByTitle } = render()

    getByTitle('loading')
  })

  it('should render error state', async () => {
    expect.assertions(2)

    const errorMock = {
      request: {
        query: keyHolderQuery(),
        variables: {
          address: accountAddress,
        },
      },
      error: new Error('welp'),
    }

    const { getByText } = render(errorMock)

    await rtl.waitFor(() => {
      expect(getByText('Could not retrieve keys')).toBeInTheDocument()
      // should also display the error message
      expect(getByText('Network error: welp')).toBeInTheDocument()
    })
  })

  it('should show a default when no keyholder is found', async () => {
    expect.assertions(1)

    const noResultsMock = {
      request: {
        query: keyHolderQuery(),
        variables: {
          address: accountAddress,
        },
      },
      result: {
        data: {
          keyHolders: [],
        },
      },
    }

    const { getByText } = render(noResultsMock)

    await rtl.waitFor(() => {
      expect(getByText("You don't have any keys yet")).toBeInTheDocument()
    })
  })

  it('should render the key details when keys are returned', async () => {
    expect.assertions(1)

    const resultsMock = {
      request: {
        query: keyHolderQuery(),
        variables: {
          address: accountAddress,
        },
      },
      result: {
        data: {
          keyHolders: [
            {
              address: accountAddress,
              id: accountAddress,
              keys: [aKey],
            },
          ],
        },
      },
    }

    const { getByText } = render(resultsMock)

    await rtl.waitFor(() => {
      expect(getByText('ERC20 paywall lock')).toBeInTheDocument()
    })
  })
})
