import React, { useState } from 'react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import Head from 'next/head'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { saveEmail } from '../../utils/token'
import { usePaywall } from '../../hooks/usePaywall'
import configure from '../../config'

const config = configure()

export default function HomeContent() {
  let emailInput

  if (config.isServer) {
    return null
  }

  const web3 = window.web3
  const urlParams = new URLSearchParams(window.location.search)
  const title = urlParams.get('title')
  const description = urlParams.get('description')
  const lockAddresses = urlParams.getAll('locks')

  // Let's now add the snippet!
  const lockState = usePaywall(lockAddresses)
  const [checkWallet, setCheckWallet] = useState(false)

  const onSubmit = async event => {
    event.preventDefault()
    setCheckWallet(true)
    // Ask user to sign token
    // TODO : remove once the paywall application can manage that natively
    const web3Provider = new ethers.providers.Web3Provider(web3.currentProvider)
    const saved = await saveEmail(web3Provider, lockAddresses, emailInput.value)
    setCheckWallet(false)
    if (saved) {
      // Let's now process with Unlock!
      window.unlockProtocol && window.unlockProtocol.loadCheckoutModal()
    } else {
      alert('We could not save your email address!')
    }
  }

  if (lockAddresses.length === 0) {
    return (
      <Layout noHeader>
        <Head>
          <title>{pageTitle('Newsletter')}</title>
        </Head>
        <Title>{title}</Title>

        <Error>This page is missing the required locks query parameter.</Error>
      </Layout>
    )
  }

  // TODO: remove once paywall supports saving token metadata natively
  if (!web3) {
    return (
      <Layout noHeader>
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

        {lockState === 'loading' && <span>Loading</span>}
        {lockState === 'unlocked' && (
          <Confirmed>You have successfuly subscribed! Thank you...</Confirmed>
        )}
        {lockState === 'locked' && (
          <Form onSubmit={onSubmit}>
            <Input
              required
              type="email"
              placeholder="Enter your email address"
              ref={el => (emailInput = el)}
            />
            <Button type="submit" value="Join" />
          </Form>
        )}
      </Grid>
    </Layout>
  )
}

const Error = styled.p`
  font-size: 20px;
  color: var(--red);
`

const Confirmed = styled.p`
  font-size: 20px;
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
