import React from 'react'
import Link from 'next/link'

// TODO, make the redirect content a children of <SignupSuccess />
// So that we can redirect based on where the user was when they initiated their sign up.
export const SignupSuccess = () => (
  <div>
    <span className="text-base">
      You are now signed up! We sent you a{' '}
      <strong>very important recovery email</strong>, please do not delete it!
      Visit <Link href="/settings">your settings page</Link>.
    </span>
  </div>
)

export default SignupSuccess
