// eslint-disable-next-line no-unused-vars
import React, { FormEvent, useState, useReducer, useContext } from 'react'
import styled from 'styled-components'
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
import { LoadingButton } from './user-account/styles'
import UnlockProvider from '../../services/unlockProvider'
import { StorageService } from '../../services/storageService'
import { ConfigContext } from '../../utils/withConfig'

interface LogInProps {
  showSignup: () => void
  onCancel?: () => void
  onProvider: (provider: any) => void
  network: number
}

const LogIn = ({ showSignup, onProvider, onCancel, network }: LogInProps) => {
  const config = useContext(ConfigContext)
  const storageService = new StorageService(config.networks[network].locksmith)
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

  const { emailAddress, password, error } = loginState

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    dispatch({
      change: [{ name: 'error', value: '' }],
    })
    const key = await storageService.getUserPrivateKey(emailAddress)

    // TODO: Allow users to change the provider's network from UI
    // What network do we chose here?
    const unlockProvider = new UnlockProvider(config.networks[network])

    try {
      await unlockProvider.connect({
        key,
        emailAddress,
        password,
      })
      onProvider(unlockProvider)
    } catch (e) {
      // TODO: password isn't the only thing that can go wrong here...
      dispatch({
        change: [
          { name: 'error', value: 'Wrong password... Please try again' },
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
  const submitButton = () => {
    if (submitted) {
      return <LoadingButton>Logging In...</LoadingButton>
    }

    return <SubmitButton type="submit" value="Submit" />
  }

  return (
    <Container>
      <Heading>Log In to Your Account</Heading>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="emailInput">Email Address</Label>
        <Input
          name="emailAddress"
          id="emailInput"
          type="email"
          placeholder="Enter your email"
          onChange={handleInputChange}
        />
        <br />
        <Label htmlFor="passwordInput">Password</Label>
        <Input
          name="password"
          id="passwordInput"
          type="password"
          placeholder="Enter your password"
          onChange={handleInputChange}
        />
        <br />
        {error && <LoginError>{error}</LoginError>}

        {submitButton()}
      </Form>
      <Description>
        Don&#39;t have an account?{' '}
        <LinkButton onClick={showSignup}>Sign up here.</LinkButton>
        <br />
        {onCancel && <LinkButton onClick={onCancel}>Cancel.</LinkButton>}
      </Description>
    </Container>
  )
}

LogIn.defaultProps = {
  onCancel: undefined,
}

export default LogIn

export const LoginError = styled.p`
  color: var(--red);
  margin-bottom: 5px;
  margin-top: 5px;
`

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 16px;
  color: var(--darkgrey);
`

const Input = styled.input`
  height: 60px;
  width: 100%;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`

const SubmitButton = styled.input`
  height: 60px;
  width: 100%;
  border: none;
  background-color: var(--green);
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  color: var(--white);
  margin-top: 25px;
`

const Form = styled.form`
  max-width: 600px;
`

const Label = styled.label`
  display: block;
  text-transform: uppercase;
  font-size: 10px;
  color: var(--darkgrey);
  margin-top: 10px;
  margin-bottom: 5px;
`

const LinkButton = styled.a`
  cursor: pointer;
`

const Container = styled.div`
  width: 100%;
`
