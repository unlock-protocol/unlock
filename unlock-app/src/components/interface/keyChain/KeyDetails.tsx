import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import styled from 'styled-components'
import keyHolderQuery from '../../../queries/keyHolder'
import Media from '../../../theme/media'
import 'cross-fetch/polyfill'
import { DefaultError } from '../../creator/FatalError'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../../utils/durations'
import Loading from '../Loading'

export interface KeyDetailsProps {
  address: string
  signData: (data: any, id: any) => void
  displayQR: (data: string) => void
  signatures: {
    [id: string]: {
      data: string
      signature: string
    }
  }
}

export interface OwnedKey {
  id: string
  expiration: string
  keyId: string
  lock: {
    name: string
    address: string
    expirationDuration: string
    tokenAddress: string
    price: string
  }
}

export interface KeyProps {
  ownedKey: OwnedKey
  accountAddress: string
  signData: (data: any, id: any) => void
  displayQR: (data: string) => void
  signature: null | {
    data: string
    signature: string
  }
}

export const KeyDetails = ({
  address,
  signData,
  displayQR,
  signatures,
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
          displayQR={displayQR}
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
      title="Manage your keys here"
      illustration="/static/images/illustrations/key.svg"
      critical={false}
    >
      The Keychain lets you view and manage the keys that you own. As soon as
      you have one, you&apos;ll see it on this page.
    </DefaultError>
  )
}

export class Key extends React.Component<KeyProps> {
  constructor(props: KeyProps) {
    super(props)
  }

  handleSignature = () => {
    const {
      accountAddress,
      signData,
      ownedKey: { lock },
    } = this.props
    const payload = JSON.stringify({
      accountAddress,
      lockAddress: lock.address,
      timestamp: Date.now(),
    })
    signData(payload, lock.address)
  }

  showQRCode = () => {
    const { displayQR, signature } = this.props
    if (signature) {
      displayQR(signature.data)
    }
  }

  qrButton = () => {
    const { signature } = this.props
    if (signature) {
      return (
        <button type="button" onClick={this.showQRCode}>
          Display QR Code
        </button>
      )
    }
    return (
      <button type="button" onClick={this.handleSignature}>
        Assert Ownership
      </button>
    )
  }

  render = () => {
    const {
      ownedKey: { lock, expiration },
    } = this.props
    return (
      <Box>
        <LockName>{lock.name}</LockName>
        <LockExpirationDuration>
          {durationsAsTextFromSeconds(parseInt(lock.expirationDuration))}
        </LockExpirationDuration>
        <ValidUntil>Valid Until</ValidUntil>
        <KeyExpiration>{expirationAsDate(expiration)}</KeyExpiration>
        {this.qrButton()}
      </Box>
    )
  }
}

const Box = styled.div`
  border: thin #dddddd solid;
  width: 212px;
  padding: 16px;
  border-radius: 4px;
  ${Media.phone`
width: 100%;
margin: 0 0 16px 0;
`}
  ${Media.nophone`
width: 30%;
margin: 0 16px 16px 0;
`}
  &:hover {
    border: thin #aaaaaa solid;
    box-shadow: 0px 0px 10px 3px rgba(221, 221, 221, 1);
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 100%;
`

const LockName = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  /* or 127% */

  display: flex;
  align-items: center;
  color: #4d8be8;
`

const LockExpirationDuration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  /* identical to box height, or 127% */

  display: flex;
  align-items: center;

  /* Grey 4 */

  color: #333333;
  margin-top: 8px;
`

const ValidUntil = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 8px;
  line-height: 10px;
  /* identical to box height */

  letter-spacing: 1px;
  text-transform: uppercase;
  color: #a6a6a6;
  margin-top: 8px;
`

const KeyExpiration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
`
