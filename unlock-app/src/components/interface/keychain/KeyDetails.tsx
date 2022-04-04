import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import keyHolderQuery from '../../../queries/keyHolder'
import 'cross-fetch/polyfill'
import { DefaultError } from '../../creator/FatalError'
import Loading from '../Loading'
import { OwnedKey } from './KeychainTypes'
import Key from './Key'
import LoginPrompt from '../LoginPrompt'

export const KeyDetails = () => {
  const { account, network } = useContext(AuthenticationContext)
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { address: account },
  })

  if (!account || !network) {
    return <LoginPrompt />
  }

  if (loading) return <Loading />
  if (error) {
    return (
      <DefaultError
        title="Could not retrieve keys"
        illustration="/images/illustrations/error.svg"
        critical
      >
        {error.message}
      </DefaultError>
    )
  }

  if (data.keyHolders.length == 0) {
    return <NoKeys />
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.keyHolders[0].keys.map((key: OwnedKey) => (
        <Key key={key.id} ownedKey={key} account={account} network={network} />
      ))}
    </div>
  )
}

export default KeyDetails

export const NoKeys = () => {
  return (
    <DefaultError
      title="You don't have any keys yet"
      illustration="/images/illustrations/key.svg"
      critical={false}
    >
      The Keychain lets you view and manage the keys that you own. As soon as
      you have one, you&apos;ll see it on this page.
    </DefaultError>
  )
}
