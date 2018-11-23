import styled from 'styled-components'
import React, { Component } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../components/interface/Layout'
import Error from '../components/interface/Error'
import {
  Section,
  Headline,
  SubTitle,
  CallToAction,
  ThreeColumns,
  Column,
} from '../components/Components'
import { ActionButton } from '../components/creator/CreatorLocks'
import withConfig from '../utils/withConfig'
import UnlockPropTypes from '../propTypes'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import { OpenGraphTags } from '../components/page/OpenGraphTags'

const METAMASK_REF_URL =
  'https://metamask.io' + '/?utm_source=unlock-protocol.com&utm_medium=referral'

const isMetaMaskUnlocked = () =>
  typeof window.web3 === 'object' &&
  typeof window.web3.currentProvider === 'object' &&
  window.web3.currentProvider.isMetaMask

export class Home extends Component {
  state = {
    showMetaMaskAlert: false,
  }

  componentDidMount() {
    if (!isMetaMaskUnlocked()) {
      this.setState({
        showMetaMaskAlert: true,
      })
    }
  }

  closeMetaMaskAlert = () => {
    this.setState({
      showMetaMaskAlert: false,
    })
  }

  render() {
    const {
      props: { config },
      state: { showMetaMaskAlert },
      closeMetaMaskAlert,
    } = this

    return (
      <Layout forContent>
        <Head>
          <title>{pageTitle()}</title>
          <TwitterTags />
          <OpenGraphTags />
        </Head>
        {showMetaMaskAlert && (
          <Error close={closeMetaMaskAlert}>
            <ErrorParagraph>
              Web3 is locked. Please unlock
              {' '}
              <a href={METAMASK_REF_URL}>MetaMask</a>
              {' '}
to continue.
            </ErrorParagraph>
          </Error>
        )}
        <Hero>The Web&#39;s new business model</Hero>
        <Headline>
          Unlock is a protocol which enables creators to monetize their content
          with a few lines of code in a fully decentralized way.
        </Headline>

        <Action>
          {config.env !== 'prod' && (
            <Link href="/dashboard">
              <a>
                <HomepageButton>Go to Your Dashboard</HomepageButton>
              </a>
            </Link>
          )}

          {config.env === 'prod' && (
            <HomepageButton disabled>Dashboard coming soon</HomepageButton>
          )}

          <ButtonLabel>Requires a browser with an Ethereum wallet</ButtonLabel>
        </Action>

        <ThreeColumns>
          <Column>
            <SubTitle>No More Middlemen</SubTitle>
            <ImageWithHover base="simple" />
            <Paragraph>
              There are no middlemen, no fees and no gatekeeper who could shut
              you down or control your distribution.
            </Paragraph>
          </Column>
          <Column>
            <SubTitle>Simple Integration</SubTitle>
            <ImageWithHover base="code" />
            <Paragraph>
              Unlock provides a simple snippet of code to integrate easily on
              your website, as well as several other integration tools...
            </Paragraph>
          </Column>
          <Column>
            <SubTitle>And Much More</SubTitle>
            <ImageWithHover base="more" />
            <Paragraph>
              For example, Unlock comes with a points system to reward your most
              loyal fans when they share your content with their friends!
            </Paragraph>
          </Column>
        </ThreeColumns>

        <Section>
          <CallToAction>
            Check out our open source code on
            {' '}
            <a href="https://github.com/unlock-protocol/unlock">GitHub</a>
, come
            work
            <a href="/jobs">with us</a>
            {' '}
or simply
            {' '}
            <a href="mailto:hello@unlock-protocol.com">get in touch</a>
.
          </CallToAction>
        </Section>
      </Layout>
    )
  }
}

Home.skipConstraints = true

Home.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(Home)

const ImageWithHover = styled.div`
  border-style: none;
  background: url(${props => `/static/images/pages/png/${props.base}.png`})
    no-repeat center/contain;
  width: 300px;
  height: 200px;
  &:hover {
    background: url(${props =>
    `/static/images/pages/png/${props.base}-hover.png`})
      no-repeat center/contain;
  }
  /* // Preload to avoid flickering effect */
  &:after {
    content: url(${props =>
    `/static/images/pages/png/${props.base}-hover.png`});
    display: none;
  }
`

const Hero = styled.h1`
  font-size: 36px;
  margin-top: 30px;
  margin-bottom: 0px;
  color: var(--darkgrey);
  font-weight: 700;
`

const Action = styled.div`
  display: grid;
  justify-items: center;
  grid-gap: 16px;
  margin-bottom: 50px;
`

const ButtonLabel = styled.small`
  font-size: 12px;
  font-weight: 200;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  color: var(--darkgrey);
  display: grid;
  grid-row: 2;
  justify-content: center;
  text-align: center;
`

const Paragraph = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
`

const ErrorParagraph = styled(Paragraph)`
  margin: 1em;
`

const HomepageButton = styled(ActionButton)`
  max-width: 400px;
  padding: 20px 50px;
`
