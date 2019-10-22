import React from 'react'
import styled from 'styled-components'
import Media from '../../../theme/media'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../../utils/durations'
import { OwnedKey } from './KeychainTypes'
import QRModal from './QRModal'

export interface Props {
  ownedKey: OwnedKey
  accountAddress: string
  signData: (data: any, id: any) => void
  signature: null | {
    data: string
    signature: string
  }
}

export interface State {
  showingQR: boolean
}

export class Key extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showingQR: false,
    }
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

  toggleShowingQR = () => {
    this.setState(({ showingQR }) => ({
      showingQR: !showingQR,
    }))
  }

  qrButton = () => {
    const { signature } = this.props
    if (signature) {
      return (
        <button type="button" onClick={this.toggleShowingQR}>
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

  QRUrl = () => {
    const { signature } = this.props
    let url = new URL(window.origin + '/verification')
    if (signature) {
      const data = encodeURIComponent(signature.data)
      const sig = encodeURIComponent(signature.signature)
      url.searchParams.append('data', data)
      url.searchParams.append('sig', sig)
    }
    return url.toString()
  }

  render = () => {
    const {
      ownedKey: { lock, expiration },
      signature,
    } = this.props
    const { showingQR } = this.state
    return (
      <Box>
        {signature && (
          <QRModal
            active={showingQR}
            dismiss={this.toggleShowingQR}
            sendEmail={() => {}}
            value={this.QRUrl()}
          />
        )}
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

export default Key

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
