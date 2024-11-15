'use client'

import { useState, useEffect } from 'react'
import { SetPassword } from '../interface/SetPassword'
import Loading from '../interface/Loading'
import { reEncryptPrivateKey } from '../../utils/accounts'
import UnlockProvider from '../../services/unlockProvider'

import { Badge } from '@unlock-protocol/ui'
import { locksmith } from '~/config/locksmith'
import { useSearchParams } from 'next/navigation'
import { config } from '~/config/app'
import Link from 'next/link'

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
  const [provider, setProvider] = useState<any>(null) // Not ACTUALLY using the provider because the goal here is just to change the password, not to connect the user.
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
  }, [email, recoveryKey])

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

  if (loading || !recoveryKey) {
    return <Loading />
  }

  if (error) {
    return <p>{error}</p>
  }

  if (success) {
    return (
      <div className="flex flex-col w-2/3 mx-auto gap-2">
        <h1 className="text-4xl font-bold">Recover your Unlock Account</h1>
        <p className="">
          Your password was successfuly changed. However, your account needs to{' '}
          <Link
            className="text-brand-ui-primary underline"
            href="/migrate-user"
          >
            be migrated
          </Link>
          .
        </p>
      </div>
    )
  }
  return (
    <>
      <div className="flex flex-col w-2/3 mx-auto gap-2">
        <h1 className="text-4xl font-bold">Recover your Unlock Account</h1>
        <p className="">Please, set a new password for your account.</p>
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
      email={email.replace(' ', '+')}
      recoveryKey={recoveryKey}
    />
  )
}
export default RecoverContent
