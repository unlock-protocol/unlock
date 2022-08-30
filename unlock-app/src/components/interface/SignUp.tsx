import React, { useState, useContext } from 'react'
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
    <div className="flex flex-col w-1/2 mx-auto">
      {!embedded && (
        <>
          <h1 className="mb-2 text-4xl font-bold">
            Pay For Content Seamlessly
          </h1>
          <span className="block mb-2 text-xl font-light">
            Unlock enables anyone to seamlessly buy and manage access to content
            using blockchain technology.
          </span>
          <span className="block mb-2 font-light text-md">
            At Unlock, we believe that the more accessible paid content is, the
            better it will be. To do that we&#39;re making it easy for readers
            like you to seamlessly pay for and manage your content.
          </span>
          <span className="block mb-2 font-light text-md">
            If you want to know more about Unlock&#39;s decentralized payment
            protocol, check out{' '}
            <Link href="https://unlock-protocol.com/blog">
              <a target="_blank">
                <span>our blog</span>
              </a>
            </Link>
            .
          </span>
        </>
      )}
      {embedded && <h1 className="text-4xl font-bold">Create Your Account</h1>}
      {!submitted && (
        <>
          <form className="max-w-xl" onSubmit={handleSubmit}>
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
          </form>
          <span className="flex flex-col gap-2 text-md">
            <div className="flex items-center gap-2">
              <span> Already have an account?</span>
              <a className="cursor-pointer" onClick={showLogin}>
                <Button size="tiny" variant="outlined-primary">
                  Log in
                </Button>
              </a>
              <br />
            </div>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://ethereum.org/en/wallets/"
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span> Have an Ethereum Wallet? </span>
                <Button size="tiny" variant="outlined-primary">
                  Connect it
                </Button>
              </div>
            </a>
            .
          </span>
        </>
      )}
      {submitted && (
        <div className="leading-5 text-center font-md">
          <div className="font-bold">Please check your email</div>
          <div>We need to confirm your email before proceeding.</div>
          <div>
            Once you&#39;ve created your account you can{' '}
            <a className="cursor-pointer" onClick={showLogin}>
              <Button size="tiny" variant="outlined-primary">
                Log in here
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

SignUp.defaultProps = {
  embedded: false,
}

export default SignUp
