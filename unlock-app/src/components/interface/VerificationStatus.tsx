import React from 'react'
import sigUtil from 'eth-sig-util'
import { useQuery } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-boost'
import { DefaultError } from '../creator/FatalError'
import {
  durationsAsTextFromSeconds,
  expirationAsDate,
} from '../../utils/durations'
import { OwnedKey } from './keychain/KeychainTypes'
import keyHolderQuery from '../../queries/keyHolder'
import 'cross-fetch/polyfill'
import useGetMetadataFor from '../../hooks/useGetMetadataFor'

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

  // We pass down the { loading, error } results from this hook
  // to `OwnsKey`, which uses them to render loading and error states.
  // TODO: craft a better query to let us directly ask about the single
  // lock under consideration. This will remove the need to iterate over
  // all the user's keys to determine if they own a key to this lock.
  const queryResults = useQuery(keyHolderQuery(), {
    variables: { address: accountAddress },
  })

  let matchingKey: OwnedKey | undefined

  if (queryResults.data) {
    matchingKey = queryResults.data.keyHolders[0].keys.find((key: OwnedKey) => {
      return key.lock.address === lockAddress
    })
  }

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
      {matchingKey && (
        <div>
          <h1>{matchingKey.lock.name}</h1>
          <p>Token ID: {matchingKey.keyId}</p>
        </div>
      )}
      <Identity valid={identityIsValid} />

      <OwnsKey
        accountAddress={accountAddress}
        loading={queryResults.loading}
        error={queryResults.error}
        matchingKey={matchingKey}
      />

      <p>
        Signed {durationsAsTextFromSeconds(secondsElapsedFromSignature)} ago.
      </p>
    </div>
  )
}

export const Identity = ({ valid }: { valid: boolean }) => (
  <p>Identity is {valid ? 'valid' : 'INVALID'}.</p>
)

/**
 * Shows public of protected attributes
 * @param visibility
 * @param attributes
 */
const metadataAttributes = (visibility: string, attributes: any) => {
  if (!attributes) {
    return
  }
  return (
    <>
      <h3>{visibility}</h3>
      <ul>
        {Object.keys(attributes).map(name => {
          return (
            <li key={name}>
              {name}: {attributes[name]}
            </li>
          )
        })}
      </ul>
    </>
  )
}

interface OwnsKeyProps {
  loading: boolean
  error: ApolloError | undefined
  matchingKey?: OwnedKey
  accountAddress: string
}
export const OwnsKey = ({
  loading,
  error,
  matchingKey,
  accountAddress,
}: OwnsKeyProps) => {
  if (loading) {
    return <p>Checking if user has a valid key...</p>
  }
  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (!matchingKey) {
    return <p>This user does not have a key to the lock.</p>
  }

  const metadata = useGetMetadataFor(matchingKey.lock.address, accountAddress)
  const expiresIn = expirationAsDate(parseInt(matchingKey.expiration))

  let validUntil = 'expired'
  if (expiresIn !== 'Expired') {
    validUntil = `valid until ${expiresIn}`
  }

  return (
    <div>
      <p>
        The user {accountAddress} owns a key, which is {validUntil}.
      </p>
      {metadataAttributes('Public', metadata.public)}
      {metadataAttributes('Protected', metadata.protected)}
    </div>
  )
}

export default VerificationStatus
