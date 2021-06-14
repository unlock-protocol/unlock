import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import { AuthenticationContext } from '../Authenticate'
import { useAccount } from '../../../hooks/useAccount'
import { PaymentDetails } from '../user-account/PaymentDetails'
import { Input, Label } from './FormStyles'
import UnlockProvider from '../../../services/unlockProvider'
import { ConfigContext } from '../../../utils/withConfig'

interface userData {
  name: string
  email: string
  password: string
}

interface NewAccountCheckoutProps {
  network: number
  showLogin: () => void
  onAccountCreated: (provider: any, paymentDetails: any) => void
}

export const NewAccountCheckout = ({
  network,
  showLogin,
  onAccountCreated,
}: NewAccountCheckoutProps) => {
  const config = useContext(ConfigContext)
  const { account } = useContext(AuthenticationContext)
  const { createUserAccount } = useAccount(account, network)
  const [error, setError] = useState('')

  const saveCard = async (
    token: string,
    card: any,
    { email, password }: userData
  ) => {
    setError('')
    try {
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

      onAccountCreated(unlockProvider, { card, token })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <PaymentDetails
      saveCard={saveCard}
      buttonLabel="Save and go to payment"
      renderError={() => {
        if (!error) {
          return null
        }
        if (error === 'ACCOUNT_ALREADY_EXISTS') {
          return (
            <>
              An account with this email already exists,{' '}
              <LinkButton onClick={() => showLogin()}>please login</LinkButton>.
            </>
          )
        }
        return (
          <>
            There was an error creating your account. Please try again in a few
            seconds.
          </>
        )
      }}
      renderChildren={({ register }) => {
        return (
          <>
            <Label>Email</Label>
            <Input
              autoComplete="username"
              name="email"
              ref={register('username', { required: true })}
            />
            <Label>Set a password</Label>
            <Input
              autoComplete="new-password"
              name="password"
              type="password"
              ref={register('password', { required: true })}
            />
          </>
        )
      }}
    />
  )
}

export default NewAccountCheckout

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const FeeNotice = styled.p`
  text-align: center;
  color: var(--green);
`

export const CardNumber = styled.p`
  text-align: center;
  color: var(--grey);
`

const LinkButton = styled.a`
  cursor: pointer;
`
