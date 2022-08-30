import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import InvalidLink from './InvalidLink'
import FinishSignUp from './FinishSignup'
import { verifyEmailSignature } from '../../utils/wedlocks'
import WedlockServiceContext from '../../contexts/WedlocksContext'
import { Button, Input } from '@unlock-protocol/ui'

interface SignUpProps {
  showLogin: () => void
  embedded?: boolean
}

// DEPRECATED?
const SignUp = ({ showLogin, embedded }: SignUpProps) => {
  const { query } = useRouter()
  const wedlockService = useContext(WedlockServiceContext)
  const [emailAddress, setEmailAddress] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const verifiedEmail =
    query.signedEmail && verifyEmailSignature(query.email, query.signedEmail)

  const handleSubmit = (event: any) => {
    event.preventDefault()
    setSubmitted(true)
    if (wedlockService) {
      const { origin } = window.location
      wedlockService.confirmEmail(emailAddress, `${origin}/signup`)
    }
  }

  const handleInputChange = (event: any) => {
    setEmailAddress(event.target.value)
  }
  const LogInLink = (callToAction: string) => (
    <LinkButton onClick={showLogin}>{callToAction}</LinkButton>
  )

  if (verifiedEmail) {
    const emailAddress = Array.isArray(query.email)
      ? query.email[0]
      : query.email
    if (emailAddress) {
      return <FinishSignUp onSuccess={() => {}} emailAddress={emailAddress} />
    }
    return <InvalidLink />
  }

  if (!verifiedEmail && query.email) {
    return <InvalidLink />
  }

  return (
    <div className="w-full">
      {!embedded && (
        <>
          <Heading>Pay For Content Seamlessly</Heading>
          <SubHeading>
            Unlock enables anyone to seamlessly buy and manage access to content
            using blockchain technology.
          </SubHeading>
          <Description>
            At Unlock, we believe that the more accessible paid content is, the
            better it will be. To do that we&#39;re making it easy for readers
            like you to seamlessly pay for and manage your content.
          </Description>
          <Description>
            If you want to know more about Unlock&#39;s decentralized payment
            protocol, check out{' '}
            <Link href="https://unlock-protocol.com/blog">
              <a target="_blank">
                <span>our blog</span>
              </a>
            </Link>
            .
          </Description>
        </>
      )}
      {embedded && <Heading>Create Your Account</Heading>}
      {!submitted && (
        <>
          <Form onSubmit={handleSubmit}>
            <div className="flex flex-col mt-2">
              <Input
                required
                name="emailAddress"
                label="Email Address"
                type="email"
                placeholder="Enter your email to get started"
                onChange={handleInputChange}
              />
              <Button type="submit">Sign up </Button>
            </div>
            <br />
            <div id="signin" />
          </Form>
          <Description>
            Already have an account? {LogInLink('Log in')}.
            <br />
            Have an Ethereum Wallet?{' '}
            <LinkButton
              target="_blank"
              rel="noopener noreferrer"
              href="https://ethereum.org/en/wallets/"
            >
              Connect it
            </LinkButton>
            .
          </Description>
        </>
      )}
      {submitted && (
        <Confirmation>
          <div>Please check your email</div>
          <div>We need to confirm your email before proceeding.</div>
          <div>
            Once you&#39;ve created your account you can{' '}
            {LogInLink('log in here')}.
          </div>
        </Confirmation>
      )}
    </div>
  )
}

SignUp.defaultProps = {
  embedded: false,
}

export default SignUp

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

const SubHeading = styled.h2`
  font-family: 'IBM Plex Serif', serif;
  font-size: 32px;
  line-height: 42px;
  font-weight: 300;
  color: var(--darkgrey);
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 16px;
  color: var(--darkgrey);
`

const Form = styled.form`
  max-width: 600px;
`

const Confirmation = styled.div`
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  color: var(--slate);
  & > div:first-child {
    font-weight: bold;
  }
`

const LinkButton = styled.a`
  cursor: pointer;
`
