import React from 'react'
import { storiesOf } from '@storybook/react'
import { FatalError } from '../../components/creator/FatalError'

import Network from '../../../public/images/illustrations/network.svg'
import Wallet from '../../../public/images/illustrations/wallet.svg'

storiesOf('FatalError', FatalError)
  .add('Network mismatch', () => {
    return (
      <FatalError title="Network mismatch" message="You’re currently on the Rinkeby Test Network but you need to be on the Main Ethereum Network. Please switch to Ethereum Main Net." illustration={Network} />
    )
  })
  .add('Wallet missing', () => {
    const linkToMetamask = (<a href='https://metamask.io/'>Metamask</a>)
    return (
      <FatalError title="Wallet missing" message={['It looks like you’re using an incompatible browser or are missig a crypto wallet. If you’re using Chrome or Firefox, you can install ', linkToMetamask, '.']} illustration={Wallet} />
    )
  })
