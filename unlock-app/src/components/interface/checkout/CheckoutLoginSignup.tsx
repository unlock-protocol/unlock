import React, { useState } from 'react'
import CheckoutLogin from './CheckoutLogin'
import CheckoutSignup from './CheckoutSignup'

interface Props {
  login?: boolean
  signup?: boolean
}

export const CheckoutLoginSignup = ({ login, signup }: Props) => {
  const [showingSignup, setShowingSignup] = useState(signup || !login)

  const toggleSignup = () => {
    setShowingSignup(!showingSignup)
  }

  if (showingSignup) {
    return <CheckoutSignup toggleSignup={toggleSignup} />
  }

  return <CheckoutLogin toggleSignup={toggleSignup} />
}
