import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Head from 'next/head'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
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
  const title = urlParams.get('title') || 'Join the newsletter'
  const description =
    urlParams.get('description') ||
    'Unlock this newsletter by purchasing your own NFT membership!'
  const lockAddresses = urlParams.getAll('locks')
  // Let's now add the snippet!
  usePaywall(lockAddresses)

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

      <Grid>
        <Description>{description}</Description>
        <EmailForm onSubmit={onSubmit} label="Join" />
      </Grid>
    </Layout>
  )
}

const Paragraph = styled.p`
  font-size: 20px;
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
