import React, { useState } from 'react'
import BrowserOnly from '../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'

interface LogInSignUpProps {
  login?: boolean
  signup?: boolean
  embedded?: boolean
  onProvider: (provider: any) => void
  onCancel?: () => void
  network: number
}

export const LogInSignUp = ({
  signup,
  login,
  embedded,
  onProvider,
  onCancel,
  network,
}: LogInSignUpProps) => {
  const [isSignup, setIsSignup] = useState(signup || !login)

  return (
    <BrowserOnly>
      {!isSignup && (
        <>
          <h1>Login to your Unlock Account</h1>
          <LogIn
            network={network}
            onCancel={onCancel}
            onProvider={onProvider}
          />
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
}

export default LogInSignUp
