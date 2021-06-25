import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Head from 'next/head'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
import Loading from '../interface/Loading'
import { pageTitle } from '../../constants'
import { usePaywall } from '../../hooks/usePaywall'
import configure from '../../config'

const config = configure()

/**
 * The form
 */
export const EmailForm = ({ onSubmit, label }) => (
  <Form onSubmit={onSubmit}>
    <Button type="submit" value={label} />
  </Form>
)

EmailForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  label: PropTypes.string,
}

EmailForm.defaultProps = {
  label: 'Join',
}

export default function HomeContent() {
  if (config.isServer) {
    return null
  }

  const urlParams = new URLSearchParams(window.location.search)
  const title = urlParams.get('title')
  const description = urlParams.get('description')
  const lockAddresses = urlParams.getAll('locks')
  // Let's now add the snippet!
  const [lockState] = usePaywall(lockAddresses)
  const [checkWallet, setCheckWallet] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    window.unlockProtocol.loadCheckoutModal()
  }

  if (lockAddresses.length === 0) {
    return (
      <Layout>
        <Head>
          <title>{pageTitle('Newsletter')}</title>
        </Head>
        <Title>{title}</Title>
        <Paragraph>
          Instantly subscribe to your favorite newsletter using crypto!
        </Paragraph>
        <Paragraph>
          <a href="https://unlock-protocol.com/">Unlock</a> is a protocol for
          memberships which lets creators monetize in a decentralized way. If
          you want to use Unlock for your newsletter, drop us a line at{' '}
          <a href="mailto:hello@unlock-protocol.com">
            hello@unlock-protocol.com
          </a>
          !
        </Paragraph>
      </Layout>
    )
  }

  return (
    <Layout noHeader>
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
            <p>
              Use your{' '}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={`${config.unlockAppUrl}/keychain`}
              >
                keychain to update your membership
              </a>
              !
            </p>
          </>
        )}

        {lockState === 'locked' && (
          <EmailForm onSubmit={onSubmit} label="Join" />
        )}
      </Grid>
    </Layout>
  )
}

const Paragraph = styled.p`
  font-size: 20px;
`

const Confirmed = styled(Paragraph)`
  color: var(--green);
`

const Form = styled.form`
  display: grid;
  margin-top: 20px;
  grid-template-columns: 1fr 110px;
`

const Button = styled.input`
  color: #ffffff;
  background: #74ce63;
  border: none;
  border-radius: 4px 4px 4px 4px;
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
