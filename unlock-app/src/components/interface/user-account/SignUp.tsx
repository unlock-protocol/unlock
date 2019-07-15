import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import queryString from 'query-string'
import { connect } from 'react-redux'
import { signupEmail } from '../../../actions/user'
import InvalidLink from '../InvalidLink'
import SignupSuccess from '../SignupSuccess'
import { Router, Account } from '../../../unlockTypes'
import FinishSignUp from '../FinishSignup'
import { verifyEmailSignature } from '../../../utils/wedlocks'

interface Props {
  signupEmail: (email: string) => any
  toggleSignup: () => void
  emailAddress?: string
  isLinkValid?: boolean
  account?: Account
}

interface State {
  emailAddress: string
  submitted: boolean // Used to handle intermediate state between submission and response
}

export class SignUp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      emailAddress: '', // eslint-disable-line react/no-unused-state
      submitted: false, // eslint-disable-line react/no-unused-state
    }
  }

  handleSubmit = (event: any) => {
    event.preventDefault()
    const { signupEmail } = this.props
    const { emailAddress } = this.state
    signupEmail(emailAddress)
    this.setState({
      submitted: true, // eslint-disable-line react/no-unused-state
    })
  }

  handleInputChange = (event: any) => {
    this.setState({
      emailAddress: event.target.value, // eslint-disable-line react/no-unused-state
    })
  }

  handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const { toggleSignup } = this.props
    e.preventDefault()
    toggleSignup()
  }

  render() {
    const { submitted } = this.state
    const { emailAddress, isLinkValid, account } = this.props

    if (account && account.address) {
      return <SignupSuccess />
    }

    const LogInLink = (callToAction: string) => (
      <LinkButton onClick={this.handleClick}>{callToAction}</LinkButton>
    )

    if (!emailAddress) {
      return (
        <div>
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
          {!submitted && (
            <Form onSubmit={this.handleSubmit}>
              <Input
                name="emailAddress"
                type="email"
                placeholder="Enter your email to get started"
                onChange={this.handleInputChange}
              />
              <SubmitButton type="submit" value="Sign Up" />
              <Description>
                Already have an account? {LogInLink('Log in here')}.
              </Description>
            </Form>
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

    if (emailAddress && !!isLinkValid) {
      return <FinishSignUp emailAddress={emailAddress} />
    }

    return <InvalidLink />
  }
}

interface StoreState {
  router: Router
  account?: Account
}

export const mapStateToProps = ({ router, account }: StoreState) => {
  const query = queryString.parse(router.location.search)
  let emailAddress
  let signedEmail
  if (query) {
    if (query.email) {
      if (typeof query.email === 'string') {
        emailAddress = query.email
      } else if (Array.isArray(query.email)) {
        emailAddress = query.email[0]
      }
    }
    if (query.signedEmail) {
      if (typeof query.signedEmail === 'string') {
        signedEmail = query.signedEmail
      } else if (Array.isArray(query.signedEmail)) {
        signedEmail = query.signedEmail[0]
      }
    }
  }

  const isLinkValid =
    !!signedEmail && verifyEmailSignature(emailAddress, signedEmail)

  return {
    emailAddress,
    isLinkValid,
    account,
  }
}

export const mapDispatchToProps = (dispatch: any) => ({
  signupEmail: (email: string) => dispatch(signupEmail(email)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUp)

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
  font-size: 20px;
  color: var(--darkgrey);
`

const Form = styled.form`
  display: grid;
  grid-template-columns: 70% 30%;
  grid-column-gap: 16px;
  max-width: 600px;
`

const Input = styled.input`
  height: 60px;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`

const SubmitButton = styled.input`
  height: 60px;
  border: none;
  background-color: var(--green);
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
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
