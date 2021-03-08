import React, { useState } from 'react'
import BrowserOnly from '../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'

interface LogInSignUpProps {
  login?: boolean
  signup?: boolean
  embedded?: boolean
  onProvider: (provider: any) => void
  onCancel: () => void
}

export const LogInSignUp = ({
  signup,
  login,
  embedded,
  onProvider,
  onCancel,
}: LogInSignUpProps) => {
  const [isSignup, setIsSignup] = useState(signup || !login)

  return (
    <BrowserOnly>
      {!isSignup && (
        <LogIn
          onCancel={onCancel}
          showSignup={() => setIsSignup(true)}
          onProvider={onProvider}
        />
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
}

export default LogInSignUp
