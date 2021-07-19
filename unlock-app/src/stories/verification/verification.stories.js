import React from 'react'
import { storiesOf } from '@storybook/react'
import {
  ValidKeyWithMetadata,
  InvalidKey,
} from '../../components/interface/verification/Key'

const ownedKey = {
  lock: {
    name: 'Week in Ethereum News',
    owner: '0x456',
  },
  keyId: 53,
  expiration: 2979853603,
}

const owner = '0x33ab07dF7f09e793dDD1E9A25b079989a557119A'

const expirationDate = 'Jun 24th, 2020'
const timeElapsedSinceSignature = '20 minutes ago'
const metadata = {}

storiesOf('Verification', module)
  .add('with an invalid key', () => {
    return <InvalidKey reason="Not valid" />
  })
  .add('with a valid key', () => {
    return (
      <ValidKeyWithMetadata
        viewerIsLockOwner={false}
        ownedKey={ownedKey}
        metadata={metadata}
        owner={owner}
        expirationDate={expirationDate}
        timeElapsedSinceSignature={timeElapsedSinceSignature}
      />
    )
  })
  .add('with a valid key viewed by the lock owner', () => {
    return (
      <ValidKeyWithMetadata
        viewerIsLockOwner
        ownedKey={ownedKey}
        metadata={metadata}
        owner={owner}
        expirationDate={expirationDate}
        timeElapsedSinceSignature={timeElapsedSinceSignature}
      />
    )
  })
  .add('with a valid key viewed with metadata!', () => {
    const metadata = {
      protected: {
        name: 'Julien',
        email: 'julien@unlock-protocol.com',
      },
    }
    return (
      <ValidKeyWithMetadata
        viewerIsLockOwner={false}
        ownedKey={ownedKey}
        metadata={metadata}
        owner={owner}
        expirationDate={expirationDate}
        timeElapsedSinceSignature={timeElapsedSinceSignature}
      />
    )
  })
  .add('with a valid key which was already checked-in', () => {
    const metadata = {
      checkedInAt: new Date().getTime(),
    }
    return (
      <ValidKeyWithMetadata
        viewerIsLockOwner={false}
        ownedKey={ownedKey}
        metadata={metadata}
        owner={owner}
        expirationDate={expirationDate}
        timeElapsedSinceSignature={timeElapsedSinceSignature}
        checkedIn
      />
    )
  })
