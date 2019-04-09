import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { connect } from 'react-redux'
import { signupEmail } from '../../actions/signUp'

interface Props {
  toggleSignUp: () => void
  signupEmail: (email: string) => any
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

  render() {
    const { submitted } = this.state
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
          protocol, check out our{' '}
          <Link href="/blog">
            <span>blog</span>
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
          </Form>
        )}
        {submitted && (
          <Confirmation>
            <div>Please check your email</div>
            <div>We need to confirm your email before proceeding.</div>
          </Confirmation>
        )}
      </div>
    )
  }
}

const mapStateToProps = (dispatch: any) => ({
  signupEmail: (email: string) => dispatch(signupEmail(email)),
})

export default connect(
  null,
  mapStateToProps
)(SignUp)

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
`

const SubHeading = styled.h2`
  font-family: 'IBM Plex Serif', serif;
  font-size: 32px;
  line-height: 42px;
  font-weight: 300;
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
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
