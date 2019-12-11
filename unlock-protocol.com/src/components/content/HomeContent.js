import styled from 'styled-components'
import React, { useContext } from 'react'

import Head from 'next/head'
import getConfig from 'next/config'
import { MembershipContext } from '../../membershipContext'
import Layout from '../interface/Layout'
import Signature from '../interface/Signature'
import { Section } from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import Svg from '../interface/svg'
import HomepageButton from '../interface/buttons/homepage/HomepageButton'
import { OptInForm } from '../interface/OptInForm'
import { Demo } from '../interface/Demo'
import Media, { NoPhone } from '../../theme/media'

const integrations = [
  {
    name: 'Paywall',
    link:
      'https://github.com/unlock-protocol/unlock/wiki/Integrating-Unlock-on-your-site',
    image: '/static/images/pages/svg/paywall.svg',
  },
  {
    name: 'WordPress',
    link: 'https://wordpress.org/plugins/unlock-protocol/',
    image: '/static/images/pages/svg/wordpress.svg',
  },
  {
    name: 'Tickets',
    link: 'https://tickets.unlock-protocol.com/',
    image: '/static/images/pages/svg/tickets.svg',
  },
  {
    name: 'Donations',
    link: 'https://donate.unlock-protocol.com/about.html',
    image: '/static/images/pages/svg/donations.svg',
  },
]
export const HomeContent = () => {
  let { isMember, becomeMember } = useContext(MembershipContext)
  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>

      <Hero>
        <NoPhone>
          <img alt="Unlock" src="/static/images/pages/svg/hero.svg" />
        </NoPhone>
        <Actions>
          <h1>Monetize the Web with memberships</h1>
          <Buttons>
            <HomepageButton
              label="Dashboard"
              destination={`${
                getConfig().publicRuntimeConfig.unlockApp
              }/dashboard`}
            >
              <Svg.Home />
            </HomepageButton>
            <HomepageButton
              label="Keychain"
              destination={`${
                getConfig().publicRuntimeConfig.unlockApp
              }/keychain`}
            >
              <Svg.Key />
            </HomepageButton>
          </Buttons>
        </Actions>
      </Hero>

      <Headline>
        Unlock lets you easily lock and manage access to your content, apps,
        community and even real life events and spaces.
      </Headline>

      <Demo isMember={isMember} becomeMember={becomeMember} />

      <Features>
        <Feature>
          <SubHead>You are in Control</SubHead>
          <Paragraph>
            Unlock is an open source protocol. Integrate it in any and every way
            you’d like. It’s also permissionless – there are no middlemen.
          </Paragraph>
          <Paragraph>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/unlock-protocol/unlock/"
            >
              Checkout our GitHub
            </a>
          </Paragraph>
        </Feature>
        <img alt="control" src="/static/images/pages/svg/control.svg" />

        <Feature>
          <SubHead>A Web3 Future</SubHead>
          <Paragraph>
            Take advantage of the blockchain and smart contracts to create
            customizable ways to access content and much more.
          </Paragraph>
        </Feature>
        <img alt="code" src="/static/images/pages/svg/code.svg" />
      </Features>

      <Section>
        <SubHead>Use Cases</SubHead>
        <Paragraph>
          We’ve built a few apps to showcase the power of Unlock. Create a lock
          on the dashboard and get started or check out some of the apps.
        </Paragraph>
        <Integrations>
          {integrations.map(integration => (
            <Integration
              key={integration.name}
              target="_blank"
              rel="noopener noreferrer"
              href={integration.link}
            >
              <h3>{integration.name}</h3>
              <img alt={integration.name} src={integration.image} />
            </Integration>
          ))}
        </Integrations>
      </Section>

      <Section>
        <SubHead>Subscribe to Updates</SubHead>
        <Paragraph>
          We will never share your information. Privacy and your trust are our
          top priorities.
        </Paragraph>
        <OptInForm />
      </Section>
      <Signature />
    </Layout>
  )
}

HomeContent.propTypes = {}

export default HomeContent

const Integrations = styled.section`
  margin-top: 50px;
  display: grid;

  ${Media.nophone`
    grid-auto-flow: column;
  `};
  ${Media.phone`
    grid-template-columns: repeat(2, 1fr);
  `};
`

const Integration = styled.a`
  text-align: center;
  display: inline-block;
`

const Features = styled.section`
  margin-top: 50px;
  padding-left: 5%;
  padding-right: 5%;
  display: grid;

  ${Media.nophone`
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
  `};

  ${Media.phone`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};

  img {
    max-width: 300px;
  }
`

const Feature = styled.div`
  font-weight: 300;
  font-size: 20px;
  line-height: 28px;
`

const Hero = styled.div`
  margin-top: 20px;
  ${Media.nophone`
    position: relative;
  `}
  img {
    width: 100%;
    height: 100%;
    min-height: 250px;
  }
`

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  > * {
    margin: 5px;
  }
`

const Actions = styled.div`
  ${Media.nophone`
    position: absolute;
    width: 60%;
    height: 75%;
    left: 5%;
    top: 12%;
  `}

  display: grid;
  align-items: center;

  h1 {
    margin-top: 0px;
    margin-bottom: 0px;
    color: var(--white);
    font-weight: 700;
    font-size: 36px;
    ${Media.phone`
      color: var(--brand);
      white-space: normal;
    `}
  }
`
const SubHead = styled.h2`
  font-size: 36px;
  margin-bottom: 0px;
  color: var(--darkgrey);
  font-weight: 700;
`

const Paragraph = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
`

export const Headline = styled.p`
  font-size: 32px;
  line-height: 42px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 100;
  margin-top: 50px;
  margin-bottom: 50px;
  padding-left: 5%;
  padding-right: 5%;
`
