import React, { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { Heading, Instructions, Label } from '../interface/FinishSignup'
import { SetPassword } from '../interface/SetPassword'
import Loading from '../interface/Loading'
import { StorageService } from '../../services/storageService'
import { reEncryptPrivateKey } from '../../utils/accounts'
import { ConfigContext } from '../../utils/withConfig'
import UnlockProvider from '../../services/unlockProvider'
import ProviderContext from '../../contexts/ProviderContext'

import {} from '../interface/Authenticate'

interface RestoreAccountProps {
  config: any
  email: string
  recoveryKey: any
  network: number
}

export const RestoreAccount = ({
  config,
  email,
  recoveryKey,
  network,
}: RestoreAccountProps) => {
  const { setProvider, provider } = useContext(ProviderContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recoveryPhrase, setRecoveryPhrase] = useState('')
  const [success, setSuccess] = useState(false)

  const storageService = new StorageService(config.services.storage.host)
  useEffect(() => {
    setLoading(true)
    const getRecoveryPhrase = async () => {
      if (email) {
        const result = await storageService.getUserRecoveryPhrase(email)
        const { recoveryPhrase } = result!
        if (!recoveryPhrase) {
          setError('We do not have a valid recovery phrase for your user')
          setLoading(false)
        } else {
          setRecoveryPhrase(recoveryPhrase) // should we do it only when we know it's the correcct one?

          // We need to log the user in from the recoveryPhrase + recoveryKey!
          // TODO: what network do we pick???
          const unlockProvider = new UnlockProvider(config.networks[network])
          try {
            await unlockProvider.connect({
              key: recoveryKey,
              emailAddress: email,
              password: recoveryPhrase,
            })
            setProvider(unlockProvider)
          } catch (e) {
            console.error(e)
            setError(
              'We could not process your recovery key. Please try again.'
            )
          }
          setLoading(false)
        }
      }
    }
    getRecoveryPhrase()
  }, [email])
  const resetPassword = async (newPassword: string) => {
    setLoading(true)
    const passwordEncryptedPrivateKey = await reEncryptPrivateKey(
      recoveryKey,
      recoveryPhrase,
      newPassword
    )
    try {
      const { data, signature } = provider.signUserData({
        passwordEncryptedPrivateKey,
      })
      await storageService.updateUserEncryptedPrivateKey(email, data, signature)
      setSuccess(true)
      // TODO: send email for confirmation
      // TODO: create new recovery key
    } catch (error: any) {
      setError('There was an error resettings your password. Please try again.')
      console.error(error)
    }
    setLoading(false)
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <p>{error}</p>
  }

  if (success) {
    return (
      <div>
        <Heading>Recover your Unlock Account</Heading>
        <Instructions>
          Your password was successfuly changed. Visit{' '}
          <Link href="/settings">
            <a>your settings page</a>
          </Link>
          .
        </Instructions>
      </div>
    )
  }
  return (
    <>
      <div>
        <Heading>Recover your Unlock Account</Heading>
        <Instructions>
          Please, set a new password for your account.
        </Instructions>
        <Label htmlFor="emailPlaceholder">Email</Label>
        <p>{email}</p>
      </div>

      <SetPassword
        loading={loading}
        buttonLabel="Resetting password"
        onSubmit={resetPassword}
      />
    </>
  )
}

interface RecoverContentProps {
  query: any
}

export const RecoverContent = ({ query }: RecoverContentProps) => {
  const config = useContext(ConfigContext)

  if (!query?.email || !query?.recoveryKey) {
    return <Loading />
  }

  const { email } = query

  let recoveryKey
  try {
    recoveryKey = JSON.parse(
      Array.isArray(query.recoveryKey)
        ? query.recoveryKey[0]
        : query.recoveryKey
    )
  } catch (error: any) {
    console.error('We could not parse the recovery key')
  }

  let content
  const defaultNetwork = 1 // This is no-op for recoveries (we do not query the chain)

  if (!email || !recoveryKey) {
    content = (
      <div>
        <Heading>Recover your Unlock Account</Heading>
        <Instructions>
          Your recovery link is not valid. Please try again.
        </Instructions>
      </div>
    )
  } else {
    content = (
      <RestoreAccount
        network={defaultNetwork} // Default to mainnet
        config={config}
        email={email}
        recoveryKey={recoveryKey}
      />
    )
  }
  return (
    <Layout title="Acccount Recovery">
      <Head>
        <title>{pageTitle('Account Recovery')}</title>
      </Head>
      {content}
    </Layout>
  )
}
export default RecoverContent
