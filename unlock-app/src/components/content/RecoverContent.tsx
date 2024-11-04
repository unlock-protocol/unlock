'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SetPassword } from '../interface/SetPassword'
import Loading from '../interface/Loading'
import { reEncryptPrivateKey } from '../../utils/accounts'
import UnlockProvider from '../../services/unlockProvider'

import { Badge } from '@unlock-protocol/ui'
import { locksmith } from '~/config/locksmith'
import { useProvider } from '~/hooks/useProvider'
import { useSearchParams } from 'next/navigation'
import { config } from '~/config/app'

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
}: RestoreAccountProps) => {
  const { setProvider, provider } = useProvider()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recoveryPhrase, setRecoveryPhrase] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setLoading(true)
    const getRecoveryPhrase = async () => {
      if (email) {
        const result = await locksmith.getUserRecoveryPhrase(email)
        const { recoveryPhrase } = result.data
        if (!recoveryPhrase) {
          setError('We do not have a valid recovery phrase for your user')
          setLoading(false)
        } else {
          setRecoveryPhrase(recoveryPhrase) // should we do it only when we know it's the correcct one?

          // We need to log the user in from the recoveryPhrase + recoveryKey!
          // TODO: what network do we pick???
          const unlockProvider = new UnlockProvider(config.networks[1])
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
      const { data, signature } = await provider.signUserData({
        passwordEncryptedPrivateKey,
      })
      await locksmith.updateUserEncryptedPrivateKey(email, data, signature)
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
        <h1 className="text-4xl font-bold">Recover your Unlock Account</h1>
        <span className="mt-1 text-sm font-thin">
          Your password was successfuly changed. Visit{' '}
          <Link href="/settings">your settings page</Link>.
        </span>
      </div>
    )
  }
  return (
    <>
      <div className="w-1/2 mx-auto">
        <h1 className="text-4xl font-bold">Recover your Unlock Account</h1>
        <span className="block mb-5 text-xl font-light">
          Please, set a new password for your account.
        </span>
        <div className="flex gap-2 mt-2 mb-3">
          <Badge>{email}</Badge>
        </div>

        <SetPassword
          loading={loading}
          buttonLabel="Resetting password"
          onSubmit={resetPassword}
        />
      </div>
    </>
  )
}

export const RecoverContent = () => {
  const searchParams = useSearchParams()

  const email = searchParams.get('email')
  let recoveryKey

  try {
    const recoveryKeyParam = searchParams.get('recoveryKey')
    if (recoveryKeyParam) {
      recoveryKey = JSON.parse(recoveryKeyParam)
    }
  } catch (error) {
    console.error('We could not parse the recovery key')
  }

  if (!email || !recoveryKey) {
    return (
      <div>
        <h1 className="text-4xl font-bold">Recover your Unlock Account</h1>
        <span className="text-sm font-thin">
          Your recovery link is not valid. Please try again.
        </span>
      </div>
    )
  }

  return (
    <RestoreAccount
      network={1} // Default to mainnet
      config={config}
      email={email}
      recoveryKey={recoveryKey}
    />
  )
}
export default RecoverContent
