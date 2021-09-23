import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import Media from '../../../theme/media'
import { expirationAsDate } from '../../../utils/durations'
import { OwnedKey } from './KeychainTypes'
import QRModal from './QRModal'
import useMetadata from '../../../hooks/useMetadata'
import { WalletServiceContext } from '../../../utils/withWalletService'
import WedlockServiceContext from '../../../contexts/WedlocksContext'

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
  account: string
  network: number
}

const Key = ({ ownedKey, account, network }: Props) => {
  const { lock, expiration, tokenURI, keyId } = ownedKey
  const walletService = useContext(WalletServiceContext)
  const wedlockService = useContext(WedlockServiceContext)

  const [error, setError] = useState<string | null>(null)
  const [showingQR, setShowingQR] = useState(false)
  const [signature, setSignature] = useState<any | null>(null)
  const handleSignature = async () => {
    setError('')
    const payload = JSON.stringify({
      network,
      account,
      lockAddress: lock.address,
      timestamp: Date.now(),
    })
    const signature = await walletService.signMessage(payload, 'personal_sign')
    setSignature({
      payload,
      signature,
    })
    setShowingQR(true)
  }

  const sendEmail = (recipient: string, qrImage: string) => {
    if (wedlockService) {
      try {
        wedlockService.keychainQREmail(
          recipient,
          `${window.location.origin}/keychain`,
          lock.name,
          qrImage
        )
      } catch {
        setError('We could not send the email. Please try again later')
      }
    } else {
      setError('We could not send the email. Please try again later')
    }
  }
  return (
    <Box>
      {signature && (
        <QRModal
          active={showingQR}
          dismiss={() => setSignature(null)}
          sendEmail={sendEmail}
          signature={signature}
        />
      )}
      <KeyBox
        lock={lock}
        expiration={expiration}
        tokenURI={tokenURI}
        keyId={keyId}
      />
      {error && <Error>{error}</Error>}
      <ButtonAction type="button" onClick={handleSignature}>
        Confirm Ownership
      </ButtonAction>
    </Box>
  )
}
export default Key

const Box = styled.div`
  display: grid;
  width: 212px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
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
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    transition: box-shadow 500ms ease;
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
  &:hover {
    color: #333;
    transition: color 100ms ease;
  }
`
const Error = styled.p`
  color: var(--red);
`
