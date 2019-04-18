import React from 'react'
import { storiesOf } from '@storybook/react'
import { KeyList } from '../../components/creator/lock/KeyList'
import doNothing from '../../utils/doNothing'

const sampleLocks = {
  '0': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e0',
    outstandingKeys: 0,
  },
  '10': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e10',
    outstandingKeys: 10,
  },
  '50': {
    address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e50',
    outstandingKeys: 50,
  },
}

const sampleKeysForLock = (count, numberStr) => {
  return Array(count)
    .fill()
    .map((_, j) => {
      return {
        id: `${numberStr} ${j}`,
        lock: `0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e${numberStr}`,
        owner: `${j}`,
        expiration:
          Math.floor(new Date('Jan 8, 3000 00:00:00').getTime() / 1000) +
          86400 * 30, // 30 days from right now
        data: 'ben@unlock-protocol.com',
      }
    })
}

storiesOf('KeyList', module)
  .add('0 keys', () => {
    return (
      <KeyList
        loadPage={doNothing}
        lock={sampleLocks['0']}
        keys={sampleKeysForLock(0, '0')}
        page={0}
      />
    )
  })
  .add('10 keys', () => {
    return (
      <KeyList
        loadPage={doNothing}
        lock={sampleLocks['10']}
        keys={sampleKeysForLock(10, '10')}
        page={0}
      />
    )
  })
  .add('50 keys on first page', () => {
    return (
      <KeyList
        loadPage={doNothing}
        lock={sampleLocks['10']}
        keys={sampleKeysForLock(10, '10')}
        page={0}
      />
    )
  })
  .add('50 keys on next page', () => {
    return (
      <KeyList
        loadPage={doNothing}
        lock={sampleLocks['10']}
        keys={sampleKeysForLock(10, '10')}
        page={1}
      />
    )
  })
  .add('50 keys on last page', () => {
    return (
      <KeyList
        loadPage={doNothing}
        lock={sampleLocks['10']}
        keys={sampleKeysForLock(10, '10')}
        page={5}
      />
    )
  })
