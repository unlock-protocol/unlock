import React, { useState, useContext, useEffect } from 'react'
import styled from 'styled-components'
import { isSignatureValidForAddress } from '../../utils/signatures'

import Loading from './Loading'
import { ValidKey, InvalidKey } from './verification/Key'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import LoginPrompt from './LoginPrompt'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { useStorageService } from '~/utils/withStorageService'

interface Props {
  data: string
  sig: string
}

interface Key {
  owner: string
  expiration: number
  tokenId: string
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ data, sig }: Props) => {
  const { account, lockAddress, timestamp, network, tokenId } = JSON.parse(data)
  const [showLogin, setShowLogin] = useState(false)
  const [lock, setLock] = useState(null)
  const [keyGranter, setKeyGranter] = useState<string>('')
  const [unlockKey, setUnlockKey] = useState<Key | null>(null)
  const [loading, setLoading] = useState(true)
  const { account: viewer } = useContext(AuthenticationContext)
  const web3Service = useContext(Web3ServiceContext)
  const storageService = useStorageService()

  useEffect(() => {
    const onLoad = async () => {
      const lock = await web3Service.getLock(lockAddress, network)
      setLock(lock)
      let key
      if (lock.publicLockVersion >= 10) {
        key = await web3Service.getKeyByTokenId(lockAddress, tokenId, network)
        console.log(key)
      } else {
        key = await web3Service.getKeyByLockForOwner(
          lockAddress,
          account,
          network
        )
      }
      setKeyGranter(await storageService?.getKeyGranter(network))
      setUnlockKey(key)
      setLoading(false)
    }

    onLoad()
  }, [lockAddress, data])

  if (loading) {
    return <Loading />
  }

  // If the signature is not valid
  if (!isSignatureValidForAddress(sig, data, account, keyGranter)) {
    return <InvalidKey reason="Signature does not match!" />
  }

  // The user does not have a key!
  if (!unlockKey) {
    return <InvalidKey reason="This key is either invalid or expired!" />
  }

  // The token id does not match
  if (unlockKey.tokenId.toString() !== tokenId.toString()) {
    return <InvalidKey reason="This key does not match the user" />
  }

  if (unlockKey.owner !== account) {
    return (
      <InvalidKey reason="The owner of this key does not match the QR code" />
    )
  }

  if (
    unlockKey.expiration != -1 &&
    unlockKey.expiration < new Date().getTime() / 1000
  ) {
    return <InvalidKey reason="This ticket has expired" />
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
        onShowLogin={() => setShowLogin(true)}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-items: center;
  flex-direction: column;
`

export default VerificationStatus
