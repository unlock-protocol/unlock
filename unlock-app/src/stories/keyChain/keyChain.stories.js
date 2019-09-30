import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { MockedProvider } from '@apollo/react-testing'
import KeyChainContent from '../../components/content/KeyChainContent'
import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'
import keyHolderQuery from '../../queries/keyHolder'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
}

const keyHoldingAccount = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e17',
}

const network = {
  name: 1984,
}

const router = {
  location: {
    pathname: '/keychain',
    search: '',
    hash: '',
  },
}

const store = createUnlockStore({
  router,
  network,
  account,
})

const keyHolderStore = createUnlockStore({
  account: keyHoldingAccount,
  network,
  router,
})

const noUserStore = createUnlockStore({
  account: undefined,
  network,
  router,
})

const ConfigProvider = ConfigContext.Provider

const mocks = [
  {
    request: {
      query: keyHolderQuery(),
      variables: {
        address: account.address,
      },
    },
    result: {
      data: {
        keyHolders: [],
      },
    },
  },
  {
    request: {
      query: keyHolderQuery(),
      variables: {
        address: keyHoldingAccount.address,
      },
    },
    result: {
      data: {
        keyHolders: [
          {
            __typename: 'KeyHolder',
            address: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            id: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            keys: [
              {
                __typename: 'Key',
                id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
                keyId: '1',
                expiration: '132546546',
                lock: {
                  __typename: 'Lock',
                  address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
                  expirationDuration: '300',
                  name: 'ERC20 paywall lock',
                  price: '1000000000000000000',
                  tokenAddress: '0x591ad9066603f5499d12ff4bc207e2f577448c46',
                },
              },
            ],
          },
        ],
      },
    },
  },
]

const config = configure({
  providers: [],
  env: 'production',
  requiredConfirmations: 12,
})

storiesOf('KeyChainContent', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>
      <MockedProvider mocks={mocks}>{getStory()}</MockedProvider>
    </ConfigProvider>
  ))
  .add('the key chain, with keys', () => {
    return (
      <Provider store={keyHolderStore}>
        <KeyChainContent />
      </Provider>
    )
  })
  .add('the key chain, no keys', () => {
    return (
      <Provider store={store}>
        <KeyChainContent />
      </Provider>
    )
  })
  .add('the key chain, no user account', () => {
    return (
      <Provider store={noUserStore}>
        <KeyChainContent />
      </Provider>
    )
  })
