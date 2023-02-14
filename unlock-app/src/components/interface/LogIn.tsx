import { Input, Button } from '@unlock-protocol/ui'
import React, { FormEvent, useState, useReducer, useEffect } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useAccount } from '../../hooks/useAccount'

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
  const { authenticateWithProvider } = useAuthenticate()

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
    <div className="flex flex-col w-full mx-auto">
      <form className="flex flex-col gap-4 mt-5" onSubmit={handleSubmit}>
        <Input
          name="emailAddress"
          autoComplete="username"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          onChange={handleInputChange}
          value={emailAddress}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          onChange={handleInputChange}
        />
        {!submitted && (
          <>
            {storedLoginEmail.length > 0 && (
              <small>Welcome back, type your password to continue</small>
            )}
          </>
        )}
        <Button type="submit" value="Submit" loading={submitted}>
          {!submitted ? 'Login' : 'Logging In...'}
        </Button>
        {error && <span className="text-red-500 font-sm">{error}</span>}
      </form>
      <p className="mt-2">
        {onCancel && (
          <button className="underline cursor-pointer" onClick={onCancel}>
            Cancel
          </button>
        )}
        {useWallet && (
          <p>
            <button className="underline cursor-pointer" onClick={useWallet}>
              Use crypto wallet
            </button>
          </p>
        )}
      </p>
    </div>
  )
}

LogIn.defaultProps = {
  onCancel: undefined,
  useWallet: undefined,
  storedLoginEmail: '',
}

export default LogIn
