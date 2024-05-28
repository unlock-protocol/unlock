import { signIn, signOut, useSession } from 'next-auth/react'
import React from 'react'

type NextAuthAccountProps = {}

const NextAuthAccount = ({}: NextAuthAccountProps) => {
  const { data: session } = useSession()

  return (
    <div className="">
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  )

  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn('google')}>Sign in</button>
    </>
  )
}

export default NextAuthAccount
