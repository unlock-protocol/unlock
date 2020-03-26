/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Label, Input, Button, ErrorButton, LoadingButton } from './FormStyles'
import { Ellipsis } from './LockVariations'
import { resetError } from '../../../actions/error'
import { loginCredentials, Credentials } from '../../../actions/user'
import { UnlockError, WarningError, isWarningError } from '../../../utils/Error'

interface Props {
  errors: WarningError[]
  close: (e: WarningError) => void
  loginCredentials: (credentials: Credentials) => void
}

export const CheckoutLogin = ({ errors, close, loginCredentials }: Props) => {
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = (data: any) => {
    const { password, emailAddress } = data
    loginCredentials({
      password,
      emailAddress,
    })
    setLoading(true)
  }

  const getButton = () => {
    if (errors.length) {
      return (
        <ErrorButton
          onClick={() => {
            errors.forEach(error => close(error))
            handleSubmit(onSubmit)()
          }}
        >
          Retry
        </ErrorButton>
      )
    }

    if (loading) {
      return (
        <LoadingButton>
          <span>
            Loading
            <Ellipsis />
          </span>
        </LoadingButton>
      )
    }

    return <Button type="submit">Log In</Button>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4>Log In</h4>
      <Label>Email Address</Label>
      <Input name="emailAddress" ref={register({ required: true })} />
      <Label>Password</Label>
      <Input
        name="password"
        type="password"
        ref={register({ required: true })}
      />
      {getButton()}
    </form>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  loginCredentials: ({ emailAddress, password }: Credentials) =>
    dispatch(loginCredentials({ emailAddress, password })),
  close: (e: WarningError) => {
    dispatch(resetError(e))
  },
})

interface ReduxState {
  account?: Account
  errors: UnlockError[]
}

export const mapStateToProps = ({ account, errors }: ReduxState) => {
  const logInWarnings = errors.filter(
    e => isWarningError(e) && (e.kind === 'LogIn' || e.kind === 'Storage')
  )

  return {
    account,
    errors: logInWarnings as WarningError[],
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutLogin)
