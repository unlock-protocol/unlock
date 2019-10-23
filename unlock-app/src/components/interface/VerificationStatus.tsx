import React from 'react'
import sigUtil from 'eth-sig-util'
import { useQuery } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-boost'
import { DefaultError } from '../creator/FatalError'
import {
  durationsAsTextFromSeconds,
  expirationAsDate,
} from '../../utils/durations'
import { OwnedKey } from './keyChain/KeychainTypes'
import keyHolderQuery from '../../queries/keyHolder'
import 'cross-fetch/polyfill'

interface VerificationData {
  accountAddress: string
  lockAddress: string
  timestamp: number
}

interface Props {
  data?: VerificationData
  sig?: string
  hexData?: string
}

export const VerificationStatus = ({ data, sig, hexData }: Props) => {
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

  const queryResults = useQuery(keyHolderQuery(), {
    variables: { address: accountAddress },
  })

  const secondsElapsedFromSignature = Math.floor(
    (Date.now() - timestamp) / 1000
  )

  const identityIsValid =
    sigUtil.recoverPersonalSignature({
      data: hexData,
      sig,
    }) === accountAddress.toLowerCase()

  return (
    <div>
      <Identity valid={identityIsValid} />

      <OwnsKey
        loading={queryResults.loading}
        error={queryResults.error}
        data={queryResults.data}
        lockAddress={lockAddress}
      />

      <h2>Signed At</h2>
      <p>{durationsAsTextFromSeconds(secondsElapsedFromSignature)} ago.</p>
    </div>
  )
}

export const Identity = ({ valid }: { valid: boolean }) => (
  <p>Identity is {valid ? 'valid' : 'INVALID'}.</p>
)

interface OwnsKeyProps {
  loading: boolean
  error: ApolloError | undefined
  data: any
  lockAddress: string
}
export const OwnsKey = ({
  loading,
  error,
  data,
  lockAddress,
}: OwnsKeyProps) => {
  if (loading) {
    return <p>Checking if user has a valid key...</p>
  } else if (error) {
    return <p>Error: {error.message}</p>
  }

  const matchingKey: OwnedKey | undefined = data.keyHolders[0].keys.find(
    (key: OwnedKey) => {
      return key.lock.address === lockAddress
    }
  )

  if (!matchingKey) {
    return <p>This user does not have a key to the lock.</p>
  }

  const expiresIn = expirationAsDate(parseInt(matchingKey.expiration))

  if (expiresIn === 'Expired') {
    return <p>The key has EXPIRED</p>
  }

  return <p>This user DOES own a key, which is valid until {expiresIn}</p>
}

export default VerificationStatus
