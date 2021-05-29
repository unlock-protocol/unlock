import React from 'react'
import { storiesOf } from '@storybook/react'
import { MockedProvider } from '@apollo/react-testing'
import KeychainContent from '../../components/content/KeychainContent'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'
import keyHolderQuery from '../../queries/keyHolder'

const account = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
}

const keyHoldingAccount = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b41e17',
}

const manyKeyHoldingAccount = {
  address: '0x3ca206264762caf81a8f0a843bbb850987b31337',
}

const network = {
  name: 1337,
}

const router = {
  location: {
    pathname: '/keychain',
    search: '',
    hash: '',
  },
}
const ConfigProvider = ConfigContext.Provider

// generate `n' fake keys to use in mock
const generateKeys = (n) => {
  const keys = []
  for (let i = 0; i < n; i++) {
    keys.push({
      __typename: 'Key',
      id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
      tokenURI:
        'https://locksmith.unlock-protocol.com/api/key/0x80bc6d2870bb72cb3e37b648c160da20733386f7/1',
      keyId: '1',
      expiration: '132546546',
      lock: {
        __typename: 'Lock',
        address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
        expirationDuration: '300',
        name: 'ERC20 paywall lock',
        price: '1000000000000000000',
        tokenAddress: '0x591ad9066603f5499d12ff4bc207e2f577448c46',
        owner: '0x3CA206264762Caf81a8F0A843bbB850987B41e16',
      },
    })
  }
  return keys
}

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
            keys: generateKeys(1),
          },
        ],
      },
    },
  },
  {
    request: {
      query: keyHolderQuery(),
      variables: {
        address: manyKeyHoldingAccount.address,
      },
    },
    result: {
      data: {
        keyHolders: [
          {
            __typename: 'KeyHolder',
            address: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            id: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            keys: generateKeys(10),
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

storiesOf('KeychainContent', module)
  .addDecorator((getStory) => (
    <ConfigProvider value={config}>
      <MockedProvider mocks={mocks}>{getStory()}</MockedProvider>
    </ConfigProvider>
  ))
  .add('the key chain, with keys', () => {
    return <KeychainContent />
  })
  .add('the key chain, with keys and signatures', () => {
    return <KeychainContent />
  })
  .add('the key chain, with many keys', () => {
    return <KeychainContent />
  })
  .add('the key chain, no keys', () => {
    return <KeychainContent />
  })
