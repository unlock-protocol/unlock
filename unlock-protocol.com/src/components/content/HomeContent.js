import styled from 'styled-components'
import React from 'react'

import Head from 'next/head'
import getConfig from 'next/config'
import Layout from '../interface/Layout'
import Signature from '../interface/Signature'
import { Section } from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import Svg from '../interface/svg'
import { OptInForm } from '../interface/OptInForm'
import { Demo } from '../interface/Demo'
import Media from '../../theme/media'

const integrations = [
  {
    name: 'Paywall',
    link: 'https://github.com/unlock-protocol/unlock/wiki/Integrating-Unlock-on-your-site',
    image: '/static/images/pages/svg/paywall.svg',
  },
  {
    name: 'WordPress',
    link: 'https://wordpress.org/plugins/unlock-protocol/',
    image: '/static/images/pages/svg/wordpress.svg',
  },
  {
    name: 'Tickets',
    link: 'https://docs.unlock-protocol.com/tutorials/selling-tickets-for-an-event',
    image: '/static/images/pages/svg/tickets.svg',
  },
  {
    name: 'Donations',
    link: 'https://docs.unlock-protocol.com/tutorials/receiving-donations-on-github',
    image: '/static/images/pages/svg/donations.svg',
  },
  {
    name: 'Newsletters',
    link: 'https://docs.unlock-protocol.com/tutorials/using-unlock-newsletter',
    image: '/static/images/blog/introducing-newsletter/newsletter.jpg',
  },
]
export const HomeContent = () => {
  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>

      <Grid>
        <Hero>Monetize the web through memberships</Hero>
        <BannerKey
          src="/static/images/illustrations/banner-key.png"
          alt=""
          width="192"
        />
        <SubTitle>
          Unlock lets you easily lock and manage access to your content, apps,
          community and even real life events and spaces.
        </SubTitle>
        <Buttons>
          <Dashboard>
            <Button
              href={`${getConfig().publicRuntimeConfig.unlockApp}/dashboard`}
            >
              <Svg.Home />
              <span>Dashboard</span>
            </Button>
            <p>
              Create and manage locks to monetize access to your content, events
              and any other member perks.
            </p>
          </Dashboard>
          <Keychain>
            <Button
              href={`${getConfig().publicRuntimeConfig.unlockApp}/keychain`}
            >
              <Svg.Key />
              <span>Keychain</span>
            </Button>
            <p>
              Manage all your keys and memberships with or without a third party
              crypto wallet.
            </p>
          </Keychain>
        </Buttons>
        <DemoWrapper>
          <Demo />
        </DemoWrapper>
        <Features>
          <Feature>
            <SubHead>You are in Control</SubHead>
            <Paragraph>
              Unlock is an open source protocol. Integrate it in any and every
              way you’d like. It’s also permissionless – there are no middlemen.
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
            <Paragraph>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.unlock-protocol.com"
              >
                Checkout our Docs
              </a>
            </Paragraph>
          </Feature>
          <img alt="code" src="/static/images/pages/svg/code.svg" />
        </Features>
        <UseCases>
          <SubHead>Use Cases</SubHead>
          <Paragraph>
            We’ve built a few apps to showcase the power of Unlock. Create a
            lock on the dashboard and get started or check out some of the apps.
          </Paragraph>
          <Integrations>
            {integrations.map((integration) => (
              <Integration
                key={integration.name}
                target="_blank"
                rel="noopener noreferrer"
                href={integration.link}
              >
                <h3>{integration.name}</h3>
                <Illustration>
                  <img
                    alt={integration.name}
                    src={integration.image}
                    width="136"
                  />
                </Illustration>
              </Integration>
            ))}
          </Integrations>
        </UseCases>

        <Newsletter>
          <SubHead>Join the Community Newsletter</SubHead>
          <Paragraph>
            We will never share your information. Privacy and your trust are our
            top priorities.
          </Paragraph>
          <OptInForm />
        </Newsletter>
      </Grid>

      <Signature />
    </Layout>
  )
}

HomeContent.propTypes = {}

export default HomeContent

const Grid = styled.div`
  display: grid;
  ${Media.nophone`
    grid-template-columns: repeat(10, 1fr);
      padding-top: 50px;

  `};
  ${Media.phone`
    grid-template-columns: 1fr;
  `};

  grid-gap: 0px;
`

const Hero = styled.h1`
  ${Media.nophone`
    grid-column: 2/8;
  `};

  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 52px;
`

const DemoWrapper = styled.section`
  margin-top: 64px;
  ${Media.nophone`
    grid-column: 3/9;
  `}
`

const BannerKey = styled.img`
  ${Media.nophone`
    grid-column: 8/10;
  `};
  ${Media.phone`
    grid-row: 1;
  `};
  margin: auto;
`

const UseCases = styled(Section)`
  ${Media.nophone`
  grid-column: 1/12;
  `}
`

const Newsletter = styled(Section)`
  ${Media.nophone`
  grid-column: 1/12;
  `}
`

const SubTitle = styled.h2`
  ${Media.nophone`
  grid-column: 1/12;
  `};
  font-family: IBM Plex Serif;
  font-style: normal;
  font-weight: 300;
  font-size: 32px;
  line-height: 42px;
  color: var(--darkgrey);
`

const Buttons = styled.section`
  ${Media.nophone`
    grid-column: 2/10;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 100px;
  `}

  ${Media.phone`
    grid-gap: 30px;
  `}
  display: grid;

  p {
    font-size: 16px;
    font-weight: normal;
  }
`

const Dashboard = styled.div``
const Keychain = styled.div``
const Button = styled.a`
  display: block;
  border: 1px solid var(--link);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  border-radius: 4px;

  > span {
    vertical-align: middle;
  }

  > svg {
    margin: 16px;
    vertical-align: middle;
    height: 24px;
    width: 24px;
    fill: var(--white);
    background-color: var(--link);
    border-radius: 12px;
  }
  &:hover {
    color: var(--white);
    background-color: var(--link);
    > svg {
      fill: var(--link);
      background-color: var(--white);
    }
  }
`

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

const Illustration = styled.div`
  margin: auto;
  width: 136px;
  height: 136px;
  display: grid;
  justify-items: center;
  align-items: center;
`

const Features = styled.section`
  ${Media.nophone`
  grid-column: 1/12;
  `}
  margin-top: 50px;
  padding-left: 5%;
  padding-right: 5%;
  display: grid;

  ${Media.nophone`
    grid-template-columns: 1fr 300px;
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
