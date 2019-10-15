import React from 'react'
import * as rtl from 'react-testing-library'
import { MockedProvider } from '@apollo/react-testing'
import {
  Key,
  OwnedKey,
  KeyDetails,
} from '../../../../components/interface/keyChain/KeyDetails'
import keyHolderQuery from '../../../../queries/keyHolder'

const accountAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const aKey: OwnedKey = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  keyId: '1',
  lock: {
    address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0xbadc0ffee',
    price: '50',
  },
}
/* const aSignature = {
 *   data: 'nice',
 *   signature: 'really nice',
 * } */

describe('keyChain -- Key', () => {
  it('should render the lock name', () => {
    expect.assertions(0)
    const signData = jest.fn()
    const { getByText } = rtl.render(
      <Key
        signData={signData}
        signature={null}
        displayQR={jest.fn()}
        accountAddress={accountAddress}
        ownedKey={aKey}
      />
    )

    getByText(aKey.lock.name)
  })

  it('should dispatch a payload to be signed', () => {
    expect.assertions(1)
    const signData = jest.fn()
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 1530518207007)
    global.Date.now = dateNowStub
    const { getByText } = rtl.render(
      <Key
        signData={signData}
        signature={null}
        displayQR={jest.fn()}
        accountAddress={accountAddress}
        ownedKey={aKey}
      />
    )

    const button = getByText('Assert Ownership')
    rtl.fireEvent.click(button)

    expect(signData).toHaveBeenCalledWith(
      JSON.stringify({
        accountAddress,
        lockAddress: aKey.lock.address,
        timestamp: dateNowStub(),
      }),
      aKey.lock.address
    )

    global.Date.now = realDateNow
  })
})

describe('keyChain -- KeyDetails', () => {
  it('should render loading state', () => {
    expect.assertions(0)
    const signData = jest.fn()

    const { getByTitle } = rtl.render(
      <MockedProvider mocks={[]}>
        <KeyDetails
          address={accountAddress}
          signData={signData}
          displayQR={jest.fn}
          signatures={{}}
        />
      </MockedProvider>
    )

    getByTitle('loading')
  })

  it('should render error state', async () => {
    expect.assertions(2)
    const signData = jest.fn()

    const errorMock = {
      request: {
        query: keyHolderQuery(),
        variables: {
          address: accountAddress,
        },
      },
      error: new Error('welp'),
    }

    const { getByText } = rtl.render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <KeyDetails
          address={accountAddress}
          signData={signData}
          displayQR={jest.fn}
          signatures={{}}
        />
      </MockedProvider>
    )

    await rtl.wait(() => {
      expect(getByText('Could not retrieve keys')).toBeInTheDocument()
      // should also display the error message
      expect(getByText('Network error: welp')).toBeInTheDocument()
    })
  })

  it('should show a default when no keyholder is found', async () => {
    expect.assertions(1)
    const signData = jest.fn()

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

    const { getByText } = rtl.render(
      <MockedProvider mocks={[noResultsMock]} addTypename={false}>
        <KeyDetails
          address={accountAddress}
          signData={signData}
          displayQR={jest.fn}
          signatures={{}}
        />
      </MockedProvider>
    )

    await rtl.wait(() => {
      expect(getByText('Manage your keys here')).toBeInTheDocument()
    })
  })

  it('should render the key details when keys are returned', async () => {
    expect.assertions(1)
    const signData = jest.fn()

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

    const { getByText } = rtl.render(
      <MockedProvider mocks={[resultsMock]} addTypename={false}>
        <KeyDetails
          address={accountAddress}
          signData={signData}
          displayQR={jest.fn}
          signatures={{}}
        />
      </MockedProvider>
    )

    await rtl.wait(() => {
      expect(getByText('ERC20 paywall lock')).toBeInTheDocument()
    })
  })
})
