import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isSignatureValidForAddress } from '../../utils/signatures'
import { DefaultError } from '../creator/FatalError'
import { OwnedKey } from './keychain/KeychainTypes'
import keyHolderQuery from '../../queries/keyHolder'
import 'cross-fetch/polyfill'
import Loading from './Loading'
import { ValidKey, InvalidKey } from './verification/Key'
import { Account as AccountType } from '../../unlockTypes'

interface VerificationData {
  accountAddress: string
  lockAddress: string
  timestamp: number
}

interface Props {
  account?: AccountType
  data?: VerificationData | null
  sig?: string
  hexData?: string
}

/**
 * React components which given data, signature will verify the validity of a key
 * and display the right status
 */
export const VerificationStatus = ({ data, sig, hexData, account }: Props) => {
  if (!data || !sig || !hexData) {
    return (
      <DefaultError
        illustration="/static/images/illustrations/error.svg"
        title="No Signature Data Found"
        critical
      >
        We couldn&apos;t find a signature payload in the URL. Please check that
        you scanned the correct QR code.
      </DefaultError>
    )
  }

  const { accountAddress, lockAddress, timestamp } = data

  // TODO: craft a better query to let us directly ask about the single
  // lock under consideration. This will remove the need to iterate over
  // all the user's keys to determine if they own a key to this lock.
  const { loading, error, data: keys } = useQuery(keyHolderQuery(), {
    variables: { address: accountAddress },
  })

  if (loading) {
    return <Loading />
  }

  if (error) {
    // We could not load the user keys...
    return <p>Key could not be loaded... Please try again</p>
  }

  // If the signature is not valid
  if (!isSignatureValidForAddress(sig, hexData, accountAddress)) {
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

  return (
    <ValidKey
      viewer={account && account.address}
      owner={accountAddress}
      signatureTimestamp={timestamp}
      ownedKey={matchingKey}
      signature={sig}
    />
  )
}

VerificationStatus.defaultProps = {
  account: null,
  data: null,
  sig: '',
  hexData: '',
}

export default VerificationStatus
