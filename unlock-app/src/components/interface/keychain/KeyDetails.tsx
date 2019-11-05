import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import styled from 'styled-components'
import keyHolderQuery from '../../../queries/keyHolder'
import 'cross-fetch/polyfill'
import { DefaultError } from '../../creator/FatalError'
import Loading from '../Loading'
import { OwnedKey } from './KeychainTypes'
import Key from './Key'

export interface KeyDetailsProps {
  address: string
  signData: (data: any, id: any) => void
  qrEmail: (recipient: string, lockName: string, keyQR: string) => void
  signatures: {
    [id: string]: {
      data: string
      signature: string
    }
  }
}

export const KeyDetails = ({
  address,
  signData,
  signatures,
  qrEmail,
}: KeyDetailsProps) => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { address },
  })

  if (loading) return <Loading />
  if (error) {
    return (
      <DefaultError
        title="Could not retrieve keys"
        illustration="/static/images/illustrations/error.svg"
        critical
      >
        {error.message}
      </DefaultError>
    )
  }

  if (data.keyHolders.length == 0) {
    return <NoKeys />
  }

  return (
    <Container>
      {data.keyHolders[0].keys.map((key: OwnedKey) => (
        <Key
          key={key.id}
          ownedKey={key}
          accountAddress={address}
          signData={signData}
          qrEmail={qrEmail}
          signature={signatures[key.lock.address] || null}
        />
      ))}
    </Container>
  )
}

export default KeyDetails

export const NoKeys = () => {
  return (
    <DefaultError
      title="You don't have any keys yet"
      illustration="/static/images/illustrations/key.svg"
      critical={false}
    >
      The Keychain lets you view and manage the keys that you own. As soon as
      you have one, you&apos;ll see it on this page.
    </DefaultError>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 100%;
`
