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
import RefundButton from './RefundButton'
import keyHolderQuery from '../../queries/keyHolder'
import withConfig from '../../utils/withConfig'
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
  config: {
    externalRefundContractAddress: string
    providers: { [name: string]: any }
  }
}

export const VerificationStatus = ({ data, sig, hexData, config }: Props) => {
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

  const { providers, externalRefundContractAddress } = config
  const provider = providers[Object.keys(providers)[0]]

  return (
    <div>
      <Identity valid={identityIsValid} />

      <OwnsKey
        loading={queryResults.loading}
        error={queryResults.error}
        matchingKey={matchingKey}
      />

      <p>
        Signed {durationsAsTextFromSeconds(secondsElapsedFromSignature)} ago.
      </p>
      {matchingKey &&
        identityIsValid &&
        lockAddress.toLowerCase() ===
          '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5'.toLowerCase() && (
          <RefundButton
            provider={provider}
            externalRefundContractAddress={externalRefundContractAddress}
            accountAddress={accountAddress}
          />
        )}
    </div>
  )
}

export const Identity = ({ valid }: { valid: boolean }) => (
  <p>Identity is {valid ? 'valid' : 'INVALID'}.</p>
)

interface OwnsKeyProps {
  loading: boolean
  error: ApolloError | undefined
  matchingKey?: OwnedKey
}
export const OwnsKey = ({ loading, error, matchingKey }: OwnsKeyProps) => {
  if (loading) {
    return <p>Checking if user has a valid key...</p>
  } else if (error) {
    return <p>Error: {error.message}</p>
  }

  if (!matchingKey) {
    return <p>This user does not have a key to the lock.</p>
  }

  const expiresIn = expirationAsDate(parseInt(matchingKey.expiration))

  if (expiresIn === 'Expired') {
    return <p>The key has EXPIRED</p>
  }

  return <p>This user DOES own a key, which is valid until {expiresIn}</p>
}

export default withConfig(VerificationStatus)
