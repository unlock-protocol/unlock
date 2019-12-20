import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ethers } from 'ethers'
import styled from 'styled-components'
import Head from 'next/head'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
import Loading from '../interface/Loading'
import { pageTitle } from '../../constants'
import { saveEmail, getEmail } from '../../utils/token'
import { usePaywall } from '../../hooks/usePaywall'
import configure from '../../config'

const config = configure()

/**
 * The form
 */
export const EmailForm = ({ email, onSubmit, onChange, label }) => (
  <Form onSubmit={onSubmit}>
    <Input
      value={email}
      required
      type="email"
      placeholder="Enter your email address"
      onChange={onChange}
    />
    <Button type="submit" value={label} />
  </Form>
)

EmailForm.propTypes = {
  email: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
}

EmailForm.defaultProps = {
  label: 'Join',
}

export default function HomeContent() {
  if (config.isServer) {
    return null
  }

  const web3 = window.web3
  const urlParams = new URLSearchParams(window.location.search)
  const title = urlParams.get('title')
  const description = urlParams.get('description')
  const lockAddresses = urlParams.getAll('locks')

  // Let's now add the snippet!
  const [lockState, lockWithKey] = usePaywall(lockAddresses)
  const [checkWallet, setCheckWallet] = useState(false)
  const [email, setEmail] = useState(undefined)

  const retrieveEmail = async () => {
    if (lockWithKey) {
      const web3Provider = new ethers.providers.Web3Provider(
        web3.currentProvider
      )
      const savedEmail = await getEmail(web3Provider, lockWithKey)
      setEmail(savedEmail)
    }
  }
  useEffect(() => {
    // Connect (this is not cool becuase it pops up immediately for the user...)
    // But this is currently the only way we can prompt the user to get their saved
    // address. Also, this means the unlock status is loaded immediately
    window.web3.currentProvider.enable()
    if (lockState === 'unlocked') {
      retrieveEmail()
    }
  }, [lockWithKey])

  const onSubmit = async (event, isUpdate) => {
    event.preventDefault()
    setCheckWallet(true)
    // Ask user to sign token
    // TODO : remove once the paywall application can manage that natively
    const web3Provider = new ethers.providers.Web3Provider(web3.currentProvider)
    const saved = await saveEmail(web3Provider, lockAddresses, email)
    setCheckWallet(false)
    if (!isUpdate) {
      if (saved) {
        // Let's now process with Unlock!
        window.unlockProtocol && window.unlockProtocol.loadCheckoutModal()
      } else {
        alert('We could not save your email address!')
      }
    } else {
      alert('Email address saved...')
    }
  }

  if (lockAddresses.length === 0) {
    return (
      <Layout>
        <Head>
          <title>{pageTitle('Newsletter')}</title>
        </Head>
        <Title>{title}</Title>
        <Paragraph>
          Instantly subscribe to your favorite crypto newsletter, using crypto!
        </Paragraph>
        <Paragraph>
          <a href="https://unlock-protocol.com/">Unlock</a> is a protocol for
          memberships, which lets creators monetize in a decentralized way.
        </Paragraph>
      </Layout>
    )
  }

  // TODO: remove once paywall supports saving token metadata natively
  if (!web3) {
    return (
      <Layout>
        <Head>
          <title>{pageTitle('Newsletter')}</title>
        </Head>
        <Title>{title}</Title>

        <Error>
          You need to a use a web browser with a crypto enabled wallet. We
          recommend{' '}
          <a href="https://metamask.io/" target="_blank">
            MetaMask
          </a>{' '}
          for Firefox or Chrome, or{' '}
          <a href="https://www.opera.com/crypto" target="_blank">
            Opera
          </a>
          .
        </Error>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{pageTitle('Newsletter')}</title>
      </Head>
      <Title>{title}</Title>

      {checkWallet && (
        <Greyout>
          <MessageBox>
            <p>
              Please check your browser&apos;s cryptocurrency wallet to sign
              your email address!
            </p>
            <Dismiss onClick={() => setCheckWallet(false)}>Dismiss</Dismiss>
          </MessageBox>
        </Greyout>
      )}

      <Grid>
        <Description>{description}</Description>

        {lockState === 'loading' && (
          <Loading message="Please check your crypto wallet..." />
        )}
        {lockState === 'unlocked' && (
          <>
            <Confirmed>You have successfuly subscribed! Thank you...</Confirmed>
            <EmailForm
              email={email}
              onSubmit={event => onSubmit(event, true)}
              onChange={evt => setEmail(evt.target.value)}
              label="Update"
            />
          </>
        )}

        {lockState === 'locked' && (
          <EmailForm
            email={email}
            onSubmit={onSubmit}
            onChange={evt => setEmail(evt.target.value)}
            label="Join"
          />
        )}
      </Grid>
    </Layout>
  )
}

const Paragraph = styled.p`
  font-size: 20px;
`

const Error = styled(Paragraph)`
  color: var(--red);
`

const Confirmed = styled(Paragraph)`
  color: var(--green);
`

const Form = styled.form`
  display: grid;
  margin-top: 20px;
  grid-template-columns: 1fr 110px;
`

const Input = styled.input`
  font-family: IBM Plex Sans;
  font-size: 16px;

  padding-left: 20px;
  line-height: 20px;
  background: #f6f6f6;
  border: none;
  border-radius: 4px 0px 0px 4px;

  /* or 125% */
  height: 60px;
  color: #4a4a4a;
`

const Button = styled.input`
  color: #ffffff;
  background: #74ce63;
  border: none;
  border-radius: 0px 4px 4px 0px;
  height: 60px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 21px;
`

const Grid = styled.section`
  display: grid;
  grid-template-columns: 500px;
  ${Media.phone`
    grid-gap: 0;
    grid-template-columns: auto;
  `};
  padding: 0;
`
const Description = styled.p`
  font-size: 20px;
  font-weight: 100;
`

const Title = styled.h1`
  margin-top: 200px;
  ${Media.phone`
    margin-top 20px;
  `};

  margin-bottom: 20px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 50px;
  font-style: light;
  line-height: 47px;
  grid-column: 1 3;
  color: var(--brand);
  padding: 0;
`

const Greyout = styled.div`
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: var(--alwaysontop);
  & > * {
    max-height: 100%;
    overflow-y: scroll;
  }
`

const MessageBox = styled.div`
  background: var(--white);
  min-width: 50%;
  max-width: 98%;
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--darkgrey);
  font-size: 20px;
`

const Dismiss = styled.button`
  height: 24px;
  font-size: 20px;
  font-family: Roboto, sans-serif;
  text-align: center;
  border: none;
  background: none;
  color: var(--grey);

  &:hover {
    color: var(--link);
  }
`
