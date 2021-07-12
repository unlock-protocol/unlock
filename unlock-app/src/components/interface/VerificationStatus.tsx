import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/react-hooks'
import { isSignatureValidForAddress } from '../../utils/signatures'

import { OwnedKey } from './keychain/KeychainTypes'
import keyHolderQuery from '../../queries/keyHolder'
import 'cross-fetch/polyfill'
import Loading from './Loading'
import { ValidKey, InvalidKey } from './verification/Key'
import { Account as AccountType } from '../../unlockTypes'
import { AuthenticationContext } from './Authenticate'
import LoginPrompt from './LoginPrompt'

interface VerificationData {
  account: string
  lockAddress: string
  timestamp: number
}

interface Props {
  account?: AccountType
  data?: VerificationData
  sig?: string
  hexData?: string
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ data, sig, hexData }: Props) => {
  const { account, lockAddress, timestamp } = data

  // TODO: craft a better query to let us directly ask about the single
  // lock under consideration. This will remove the need to iterate over
  // all the user's keys to determine if they own a key to this lock.
  const {
    loading,
    error,
    data: keys,
  } = useQuery(keyHolderQuery(), {
    variables: { address: account },
  })
  const [showLogin, setShowLogin] = useState(false)
  const { account: viewer } = useContext(AuthenticationContext)
  if (loading) {
    return <Loading />
  }
  if (error) {
    // We could not load the user keys...
    return <p>Key could not be loaded... Please try again</p>
  }

  // If the signature is not valid
  if (!isSignatureValidForAddress(sig, hexData, account)) {
    return <InvalidKey />
  }

  let matchingKey: OwnedKey | undefined
  if (keys && keys.keyHolders) {
    matchingKey = keys.keyHolders[0].keys.find((key: OwnedKey) => {
      return key.lock.address === lockAddress
    })
  }

  // The user does not have a key!
  if (!matchingKey) {
    return <InvalidKey />
  }

  if (showLogin && !viewer) {
    return <LoginPrompt />
  }

  return (
    <Wrapper>
      <ValidKey
        viewer={viewer} /** TODO */
        owner={account}
        signatureTimestamp={timestamp}
        ownedKey={matchingKey}
        signature={sig}
      />
      {!viewer && (
        <Button onClick={setShowLogin}>Connect to check user in</Button>
      )}
    </Wrapper>
  )
}

VerificationStatus.defaultProps = {
  account: null,
  data: null,
  sig: '',
  hexData: '',
}

const Wrapper = styled.div`
  display: flex;
  justify-items: center;
  flex-direction: column;
`
const Button = styled.button`
  width: 200px;
  margin-top: 100px;
  margin: auto;
`

export default VerificationStatus
