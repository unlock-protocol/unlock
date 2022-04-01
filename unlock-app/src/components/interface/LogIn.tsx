// eslint-disable-next-line no-unused-vars
import React, { FormEvent, useState, useReducer, useEffect } from 'react'
import styled from 'styled-components'
import { useAccount } from '../../hooks/useAccount'
import {
  Button,
  LoadingButton,
  Form,
  Input,
  Label,
  FormError,
} from './checkout/FormStyles'
import { useAuthenticateHandler } from '../../hooks/useAuthenticateHandler'

interface LogInProps {
  onCancel?: () => void
  network: number
  useWallet?: () => void
  storedLoginEmail?: string
}

const LogIn = ({
  onCancel,
  network,
  useWallet,
  storedLoginEmail = '',
}: LogInProps) => {
  const { retrieveUserAccount } = useAccount('', network)
  const [loginState, dispatch] = useReducer(
    (state: any, action: any) => {
      if (action.change) {
        const newState = { ...state }
        action.change.forEach((change: any) => {
          newState[change.name] = change.value
        })
        return newState
      }
      if (action.add) {
        const newState = { ...state }
        action.add.forEach((add: any) => {
          newState[add.name].push(add.value)
        })
      }
      return { ...state }
    },
    {
      error: '',
      emailAddress: '',
      password: '',
      account: null,
    }
  )
  const [submitted, setSubmitted] = useState(false)
  const { authenticateWithProvider } = useAuthenticateHandler({})

  const { emailAddress, password, error } = loginState

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    dispatch({
      change: [{ name: 'error', value: '' }],
    })

    try {
      const unlockProvider = await retrieveUserAccount(emailAddress, password)
      authenticateWithProvider('UNLOCK', unlockProvider)
    } catch (e) {
      // TODO: password isn't the only thing that can go wrong here...
      console.error(e)
      dispatch({
        change: [
          {
            name: 'error',
            value: 'Wrong password or missing account. Please try again',
          },
        ],
      })
    }
    setSubmitted(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target
    dispatch({
      change: [{ name, value }],
    })
  }

  useEffect(() => {
    if (storedLoginEmail?.length === 0) return
    dispatch({
      change: [{ name: 'emailAddress', value: storedLoginEmail }],
    })
  }, [])

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="emailInput">Email Address</Label>
        <Input
          name="emailAddress"
          autoComplete="username"
          id="emailInput"
          type="email"
          placeholder="Enter your email"
          onChange={handleInputChange}
          value={emailAddress}
        />
        <Label htmlFor="passwordInput">Password</Label>
        <Input
          name="password"
          id="passwordInput"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          onChange={handleInputChange}
        />
        {submitted && <LoadingButton>Logging In...</LoadingButton>}
        {!submitted && (
          <>
            {storedLoginEmail.length > 0 && (
              <small>Welcome back, type your password to continue</small>
            )}
            <Button type="submit" value="Submit">
              Login
            </Button>
          </>
        )}
        {error && <FormError>{error}</FormError>}
      </Form>
      <Description>
        {onCancel && <LinkButton onClick={onCancel}>Cancel</LinkButton>}
        {useWallet && (
          <p>
            Use <LinkButton onClick={useWallet}>crypto wallet</LinkButton>
          </p>
        )}
      </Description>
    </Container>
  )
}

LogIn.defaultProps = {
  onCancel: undefined,
  useWallet: undefined,
  storedLoginEmail: '',
}

export default LogIn
const Description = styled.p`
  width: 100%;
  font-size: 14px;
  color: var(--grey);
  button {
    border: none;
    outline: none;
    display: inline;
    padding: 0;
    background-color: transparent;
    color: var(--link);
    cursor: pointer;
  }
`

const LinkButton = styled.a`
  cursor: pointer;
`

const Container = styled.div`
  width: 100%;
`
