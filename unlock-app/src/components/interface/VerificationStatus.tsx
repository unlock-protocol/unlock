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
  account: string
  lockAddress: string
  timestamp: number
  network: number
}

interface Props {
  data: VerificationData
  sig: string
  hexData: string
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ data, sig, hexData }: Props) => {
  const { account, lockAddress, timestamp, network } = data
  const [showLogin, setShowLogin] = useState(false)
  const [lock, setLock] = useState<any>(null)
  const [unlockKey, setUnlockKey] = useState<any>(null)
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
      if (!account) {
        return
      }
      const key = await getKeyForAccount(account)
      setUnlockKey(key)
      const lock = await getLock({ pricing: false })
      setLock(lock)
      setLoading(false)
    }

    onLoad()
  }, [lockAddress, getKeyForAccount, getLock, account])

  if (loading) {
    return <Loading />
  }

  // If the signature is not valid
  if (!isSignatureValidForAddress(sig, hexData, account)) {
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
