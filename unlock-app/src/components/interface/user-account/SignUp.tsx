import React from 'react'
import styled from 'styled-components'
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
        <LogInWrapper>
          {!submitted && (
            <form onSubmit={this.handleSubmit}>
              <Label htmlFor="emailAddress">Email</Label>
              <Input
                name="emailAddress"
                id="emailAddress"
                type="email"
                placeholder="Enter your email to get started"
                onChange={this.handleInputChange}
              />
              <SubmitButton type="submit" value="Sign Up" />
              <Description>
                Already have an account? {LogInLink('Log in')}.
                <br />
                Have an Ethereum Wallet?{' '}
                <LinkButton
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.unlock-protocol.com/frequently-asked-questions#what-crypto-wallet-are-supported"
                >
                  Connect it
                </LinkButton>
                .
              </Description>
            </form>
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
        </LogInWrapper>
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

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)

const LogInWrapper = styled.div`
    width: 100%;
`

const Label = styled.label`
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    color: var(--darkgrey);
    margin-top: 16px;
    margin-bottom: 5px;
`

const Description = styled.p`
    font-family: 'IBM Plex Sans', sans;
    font-weight: 300;
    font-size: 12px;
    color: var(--darkgrey);
    line-height: 24px;
`

const Input = styled.input`
    height: 48px;
    width: 100%;
    border: none;
    background-color: var(--lightgrey);
    border-radius: 4px;
    padding: 10px;
    font-size: 16px;
`

const SubmitButton = styled.input`
    height: 48px;
    width: 100%;
    border: none;
    background-color: var(--green);
    color: var(--white);
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 16px;
`

const Confirmation = styled.div`
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: var(--slate);
    & > div:first-child {
    font-weight: bold;
    }
    padding: 0 32px;
    margin-bottom: 32px;
`

const LinkButton = styled.a`
    cursor: pointer;
`
