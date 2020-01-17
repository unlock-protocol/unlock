import React from 'react'
import styled from 'styled-components'
import Media from '../../../theme/media'
import { expirationAsDate } from '../../../utils/durations'
import { OwnedKey } from './KeychainTypes'
import QRModal from './QRModal'
import useMetadata from '../../../hooks/useMetadata'

interface KeyBoxProps {
  tokenURI: string
  lock: any
  expiration: string
  keyId: string
}

const KeyBox = ({ tokenURI, lock, expiration, keyId }: KeyBoxProps) => {
  const metadata = useMetadata(tokenURI)
  return (
    <KeyContent>
      <LockIcon src={metadata.image} width="40" />
      <KeyInfo>
        <LockName>{lock.name}</LockName>
        <FieldLabel>Token ID</FieldLabel>
        <FieldValue>{keyId}</FieldValue>
        <FieldLabel>Valid Until</FieldLabel>
        <FieldValue>{expirationAsDate(expiration)}</FieldValue>
      </KeyInfo>
    </KeyContent>
  )
}

export interface Props {
  ownedKey: OwnedKey
  accountAddress: string
  signData: (data: any, id: any) => void
  qrEmail: (recipient: string, lockName: string, keyQR: string) => void
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

  componentDidUpdate = ({ signature: prevSignature }: Props) => {
    const { signature } = this.props
    // If we have just received a signature, we should immediately display the QR code.
    if (prevSignature === null && signature) {
      this.toggleShowingQR()
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
        <ButtonAction type="button" onClick={this.toggleShowingQR}>
          Display QR Code
        </ButtonAction>
      )
    }
    return (
      <ButtonAction type="button" onClick={this.handleSignature}>
        Assert Ownership
      </ButtonAction>
    )
  }

  sendEmail = (recipient: string, qrImage: string) => {
    const {
      ownedKey: { lock },
      qrEmail,
    } = this.props

    // Some small number of early locks do not have names on-chain. We'll use
    // the address to identify those.
    const name = lock.name || lock.address
    qrEmail(recipient, name, qrImage)
  }

  QRUrl = () => {
    const { signature } = this.props
    const url = new URL(`${window.location.origin}/verification`)
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
      ownedKey: { lock, expiration, tokenURI, keyId },
      signature,
    } = this.props
    const { showingQR } = this.state
    return (
      <Box>
        {signature && (
          <QRModal
            active={showingQR}
            dismiss={this.toggleShowingQR}
            sendEmail={this.sendEmail}
            value={this.QRUrl()}
          />
        )}
        <KeyBox
          lock={lock}
          expiration={expiration}
          tokenURI={tokenURI}
          keyId={keyId}
        />
        {this.qrButton()}
      </Box>
    )
  }
}

export default Key

const Box = styled.div`
  display: grid;
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

const LockIcon = styled.img`
  width: 40px;
`

const KeyContent = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  grid-gap: 15px;
  margin-bottom: 20px;
`

const KeyInfo = styled.div`
  overflow: hidden;
  min-width: 0;
`

const FieldLabel = styled.div`
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

const FieldValue = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
`

const ButtonAction = styled.button`
  cursor: pointer;
  font: inherit;
  align-self: end;
  /* background: none; */
  border: none;
  padding: 5px;
  & :hover {
    color: #333;
    transition: color 100ms ease;
  }
`
