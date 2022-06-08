import React from 'react'
import { storiesOf } from '@storybook/react'
import CheckoutContent from '../../components/content/CheckoutContent'
import { WedlockServiceContext } from '../../contexts/WedlocksContext'
import { ConfigContext } from '../../utils/withConfig'
import ProviderContext from '../../contexts/ProviderContext'
import Authenticate from '../../components/interface/Authenticate'
import configure from '../../config'
import WedlockService from '../../services/wedlockService'

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
      <WedlockServiceContext.Provider
        value={new WedlockService(config.services.wedlocks.host)}
      >
        <ProviderContext.Provider value={{ provider, setProvider }}>
          <Authenticate>
            <CheckoutContent query={query} />
          </Authenticate>
        </ProviderContext.Provider>
      </WedlockServiceContext.Provider>
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
  .add('with a single rinkeby lock and a name overide', () => {
    return render({
      callToAction: {},
      network: 4,
      locks: {
        '0xa80C0013305206593C57330905f0809c0C3994FA': {
          name: 'overide!',
        },
      },
    })
  })
  .add('with a lock with a logo and a default CTA', () => {
    return render({
      icon: 'https://app.unlock-protocol.com/images/svg/default.svg',
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
          placeholder: 'John Doe',
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
        '0x771e09a5bfef4c4b85d796a112d49e839c98d9da': {
          network: 4,
        },
      },
    })
  })
  .add('with a lock purchasable via credit card', () => {
    return render({
      callToAction: {},
      metadataInputs: [
        {
          name: 'Name',
          type: 'text',
          required: true,
        },
      ],
      network: 4,
      locks: {
        '0x61e9210b61C254b28cc7Aea472E496339D2D3265': {},
      },
    })
  })
  .add('with locks on different networks', () => {
    return render({
      callToAction: {},
      locks: {
        '0x771e09a5bfef4c4b85d796a112d49e839c98d9da': {
          network: 4,
        },
        '0x93169480cE4871691547d3e774aae41E4335e082': {
          network: 100,
        },
      },
    })
  })
  .add('with a membershi for which the user never had a membership', () => {
    return render({
      callToAction: {},
      locks: {
        '0x8Bf9b48D4375848Fb4a0d0921c634C121E7A7fd0': {
          network: 4,
        },
      },
    })
  })
