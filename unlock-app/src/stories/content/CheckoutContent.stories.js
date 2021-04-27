import React from 'react'
import { storiesOf } from '@storybook/react'
import CheckoutContent from '../../components/content/CheckoutContent'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import Authenticate from '../../components/interface/Authenticate'
import configure from '../../config'

const render = (paywallConfig) => {
  const config = configure()

  const query = {
    paywallConfig: JSON.stringify(paywallConfig),
  }

  let provider = null

  const setProvider = (p) => {
    provider = p
  }

  return (
    <ConfigContext.Provider value={config}>
      <ProviderContext.Provider value={{ provider, setProvider }}>
        <Authenticate>
          <CheckoutContent query={query} />
        </Authenticate>
      </ProviderContext.Provider>
    </ConfigContext.Provider>
  )
}

storiesOf('Checkout', module)
  .add('with a single rinkeby lock', () => {
    return render({
      callToAction: {},
      network: 4,
      locks: {
        '0xa80C0013305206593C57330905f0809c0C3994FA': {},
      },
    })
  })
  .add('with a lock with a logo', () => {
    return render({
      icon: 'https://app.unlock-protocol.com/static/images/svg/default.svg',
      callToAction: {},
      network: 4,
      locks: {
        '0xa80C0013305206593C57330905f0809c0C3994FA': {},
      },
      callToAction: {
        default:
          'Get full access to our content for as little as $2 a week. Pay with your crypto wallet or credit card with a few clicks.',
      },
    })
  })
  .add('with multiple rinkeby locks', () => {
    return render({
      callToAction: {},
      network: 4,
      locks: {
        '0xa80C0013305206593C57330905f0809c0C3994FA': {},
        '0x10F60be5de6c403d7C6aa90baD0286eAb9218F42': {},
      },
    })
  })
  .add('with multiple rinkeby locks, all of them requiring metadata', () => {
    return render({
      callToAction: {},
      network: 4,
      metadataInputs: [
        {
          name: 'Name',
          type: 'text',
          required: true,
        },
        {
          name: 'Email',
          type: 'email',
          required: true,
        },
      ],
      locks: {
        '0xa80C0013305206593C57330905f0809c0C3994FA': {},
        '0x10F60be5de6c403d7C6aa90baD0286eAb9218F42': {},
      },
    })
  })
  .add('with a lock purchasable via credit card', () => {
    return render({
      callToAction: {},
      network: 4,
      locks: {
        '0x771e09a5bfef4c4b85d796a112d49e839c98d9da': {},
        '0x3a892c7014cd05418e48ae516a6a9e700ccb3e39': {},
      },
    })
  })
