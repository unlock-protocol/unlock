import React, { useState, useContext, useEffect } from 'react'
import styled from 'styled-components'
import { isSignatureValidForAddress } from '../../utils/signatures'
import { useLock } from '../../hooks/useLock'
import { ActionButton } from './buttons/ActionButton'

import Loading from './Loading'
import { ValidKey, InvalidKey } from './verification/Key'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import LoginPrompt from './LoginPrompt'

interface VerificationData {
  account: string // owner of the NFT
  lockAddress: string // lock address
  timestamp: number // timestamp
  network: number // network
}

interface Props {
  data: string
  sig: string
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ data, sig }: Props) => {
  const { account, lockAddress, timestamp, network } = JSON.parse(data)
  const [showLogin, setShowLogin] = useState(false)
  const [lock, setLock] = useState(null)
  const [unlockKey, setUnlockKey] = useState(null)
  const [loading, setLoading] = useState(true)
  const { account: viewer } = useContext(AuthenticationContext)
  const { getKeyForAccount, getLock } = useLock(
    {
      address: lockAddress,
    },
    network
  )

  useEffect(() => {
    const onLoad = async () => {
      setUnlockKey(await getKeyForAccount(account))
      setLock(await getLock({ pricing: false }))
      setLoading(false)
    }

    onLoad()
  }, [lockAddress])

  if (loading) {
    return <Loading />
  }

  // If the signature is not valid
  if (!isSignatureValidForAddress(sig, data, account)) {
    return <InvalidKey reason="Signature does not match!" />
  }

  // The user does not have a key!
  if (!unlockKey) {
    return <InvalidKey reason="This user does not have a key!" />
  }

  if (showLogin && !viewer) {
    return <LoginPrompt />
  }

  return (
    <Wrapper>
      <ValidKey
        viewer={viewer}
        owner={account}
        signatureTimestamp={timestamp}
        unlockKey={unlockKey}
        lock={lock}
        network={network}
      />
      {!viewer && (
        <ConnectButton onClick={() => setShowLogin(true)}>
          Connect to check user in
        </ConnectButton>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-items: center;
  flex-direction: column;
`

const ConnectButton = styled(ActionButton)`
  max-width: 290px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 16px;
  color: var(--white);
`

export default VerificationStatus
