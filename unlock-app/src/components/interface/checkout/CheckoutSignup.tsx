/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useForm } from 'react-hook-form'
import { Label, Input, Button, LinkButton } from './FormStyles'
import { signupEmail } from '../../../actions/user'

interface Props {
  signupEmail: (email: string) => any
  toggleSignup: () => void
}

export const CheckoutSignup = ({ signupEmail, toggleSignup }: Props) => {
  const { register, handleSubmit } = useForm()
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (data: any) => {
    const { emailAddress } = data
    signupEmail(emailAddress)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <h4>Please check your email</h4>
        <p>We need to confirm your email before proceeding.</p>
        <p>
          Once you&#39;ve created your account you can{' '}
          <LinkButton onClick={toggleSignup}>log in here</LinkButton>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4>Sign Up</h4>
      <Label>Email Address</Label>
      <Input name="emailAddress" ref={register({ required: true })} />
      <Button type="submit">Sign Up</Button>
      <p>
        Already have an account?{' '}
        <LinkButton onClick={toggleSignup}>Log in here</LinkButton>.
      </p>
    </form>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  signupEmail: (email: string) => dispatch(signupEmail(email)),
})

export default connect(null, mapDispatchToProps)(CheckoutSignup)
