import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

// TODO, make the redirect content a children of <SignupSuccess />
// So that we can redirect based on where the user was when they initiated their sign up.
export const SignupSuccess = () => (
  <div>
    <Heading>Sign Up</Heading>
    <Description>
      You are now signed up! We sent you a{' '}
      <strong>very important recorvery email</strong>, please do not delete it!
      Visit{' '}
      <Link href="/settings">
        <a>your settings page</a>
      </Link>
      .
    </Description>
  </div>
)

export default SignupSuccess

export const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

export const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
  color: var(--darkgrey);
`
