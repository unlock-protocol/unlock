import React, { useState, useContext } from 'react'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { useAccount } from '../../../hooks/useAccount'
import { PaymentDetails } from '../user-account/PaymentDetails'
import { SignUp } from '../user-account/SignUp'
import { Input, Label } from './FormStyles'
import UnlockProvider from '../../../services/unlockProvider'
import { ConfigContext } from '../../../utils/withConfig'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface userData {
  name: string
  email: string
  password: string
}

interface NewAccountCheckoutProps {
  network: number
  showLogin: () => void
  askForCard: boolean
  onAccountCreated: (paymentDetails: any) => void
}

export const NewAccountCheckout = ({
  network,
  showLogin,
  onAccountCreated,
  askForCard,
}: NewAccountCheckoutProps) => {
  const config = useContext(ConfigContext)
  const { account } = useContext(AuthenticationContext)
  // @ts-expect-error account is _always_ defined in this component
  const { createUserAccount } = useAccount(account, network)
  const [error, setError] = useState('')
  const { authenticateWithProvider } = useAuthenticate()

  const createAccount = async (email: string, password: string, data?: any) => {
    const { passwordEncryptedPrivateKey } = await createUserAccount(
      email,
      password
    )

    const unlockProvider = new UnlockProvider(config.networks[network])

    await unlockProvider.connect({
      key: passwordEncryptedPrivateKey,
      emailAddress: email,
      password,
    })
    authenticateWithProvider('UNLOCK', unlockProvider)
    onAccountCreated(data)
  }

  if (!askForCard) {
    return <SignUp showLogin={showLogin} createAccount={createAccount} />
  }

  const onCardSaved = async (
    token: string,
    card: any,
    { email, password }: userData
  ) => {
    setError('')
    try {
      await createAccount(email, password, { card, token })
    } catch (error: any) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <>
      <p>
        Have you already created an Unlock account?{' '}
        <a className="cursor-pointer" onClick={() => showLogin()}>
          Please login
        </a>
        .
      </p>
      <PaymentDetails
        saveCard={onCardSaved}
        buttonLabel="Save and go to payment"
        renderError={() => {
          if (!error) {
            return null
          }
          if (error === 'ACCOUNT_ALREADY_EXISTS') {
            return (
              <>
                An account with this email already exists,{' '}
                <a className="cursor-pointer" onClick={() => showLogin()}>
                  please login
                </a>
                .
              </>
            )
          }
          return (
            <>
              There was an error creating your account. Please try again in a
              few seconds.
            </>
          )
        }}
        renderChildren={({ register }) => {
          return (
            <>
              <Label>Email</Label>
              <Input
                autoComplete="username"
                {...register('email', { required: true })}
              />
              <Label>Set a password</Label>
              <Input
                autoComplete="new-password"
                type="password"
                {...register('password', { required: true })}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default NewAccountCheckout
