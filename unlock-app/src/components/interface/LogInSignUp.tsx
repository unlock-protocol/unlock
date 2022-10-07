import React, { useState } from 'react'
import BrowserOnly from '../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'

interface LogInSignUpProps {
  login?: boolean
  signup?: boolean
  embedded?: boolean
  onCancel?: () => void
  network: number
  useWallet?: () => void
}

export const LogInSignUp = ({
  signup,
  login,
  embedded,
  onCancel,
  network,
  useWallet,
}: LogInSignUpProps) => {
  const [isSignup, setIsSignup] = useState(signup || !login)

  return (
    <BrowserOnly>
      {!isSignup && (
        <>
          <LogIn network={network} onCancel={onCancel} useWallet={useWallet} />
        </>
      )}
      {isSignup && (
        <SignUp showLogin={() => setIsSignup(false)} embedded={embedded} />
      )}
    </BrowserOnly>
  )
}

LogInSignUp.defaultProps = {
  signup: false,
  login: true,
  embedded: false,
  onCancel: null,
  useWallet: null,
}

export default LogInSignUp
