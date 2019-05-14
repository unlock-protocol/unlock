import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

export const InvalidLink = () => (
  <div>
    <Heading>Sign Up</Heading>
    <Description>
      The link you used is invalid. Please try again.{' '}
      <Link href="/signup">
        <a>Sign up</a>
      </Link>
      .
    </Description>
  </div>
)

export default InvalidLink

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
  color: var(--darkgrey);
`
