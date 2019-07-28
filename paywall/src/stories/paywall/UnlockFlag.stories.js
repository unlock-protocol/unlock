import React from 'react'
import { storiesOf } from '@storybook/react'
import { UnlockedFlag } from '../../components/paywall/UnlockFlag'

const key = {
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc87eeeeee',
  lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  expiration: new Date('December 31, 3000 12:00:00').getTime() / 1000,
}

storiesOf('Paywall/UnlockedFlag', module).add('the unlocked flag', () => {
  return <UnlockedFlag keys={[key]} expiration="April 5, 2019" />
})
