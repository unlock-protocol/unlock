import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../components/interface/Layout'
import {
  Section,
  Title,
  Headline,
  SubTitle,
  CallToAction,
  ThreeColumns,
  Column,
  TwoColumns,
} from '../components/Components'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'

export const About = () => (
  <Layout forContent>
    <Head>
      <title>{pageTitle('About')}</title>
      <TwitterTags
        title={pageTitle('About')}
        description="We’re a small, smart and nimble team of coders and designers with a vision for a better and fairer way to monetize content."
      />
      <OpenGraphTags
        title={pageTitle('About')}
        description="We’re a small, smart and nimble team of coders and designers with a vision for a better and fairer way to monetize content."
        canonicalPath="/about"
      />
    </Head>
    <Section>
      <Title>About</Title>
      <Headline>
        We’re a small, smart and nimble team of coders and designers with a
        vision for a better and fairer way to monetize content.
      </Headline>
      <TwoColumns>
        <Column>
          At Unlock, we believe the web needs a new business model. We believe
          the decentralization promise of the web cannot be achieved if economic
          incentives are not aligned between consumers and creators.
          <br />
          <br />
          For this, we&#39;re building a protocol which lets anyone restrict
          access to their work and for consumers to earn points when they
          discover and promote the best creations.
        </Column>
        <Column>
          The Unlock Protocol can be applied to publishing (paywalls),
          newsletters, software licenses or even the physical world, such as
          transportation systems. The web revolutionized all of these areas -
          Unlock will make them economically viable.
        </Column>
      </TwoColumns>
    </Section>

    <Section>
      <Title>Team</Title>
      <ThreeColumns>
        <Column>
          <SubTitle>Julien Genestoux</SubTitle>
          <Photo src="/static/images/illustrations/julien.jpg" />
          <p>
            I am an entrepreneur and a software engineer. I am a vocal web
            advocate who co-authored the W3C WebSub protocol. I sold my previous
            company, Superfeedr, an RSS feed API, to Medium. Born in France, I
            currently live in Brooklyn.
          </p>
          <small>
            <a href="https://www.ouvre-boite.com/">Personal site</a>
            {' '}
-
            {' '}
            <a href="https://www.linkedin.com/in/juliengenestoux/">LinkedIn</a>
          </small>
        </Column>
        <Column>
          <SubTitle>Ben Werdmuller</SubTitle>
          <Photo src="/static/images/illustrations/ben.jpg" />
          <p>
            I work at the intersection of technology, media, and democracy. I
            co-founded Elgg and Known, worked on Medium and Latakoo, and
            invested in innovative media startups to support a stronger
            democracy at Matter.
          </p>
          <small>
            <a href="https://benwerd.com/">Personal site</a>
            {' '}
-
            {' '}
            <a href="https://www.linkedin.com/in/benwerd/">LinkedIn</a>
          </small>
        </Column>
        <Column>
          <SubTitle>Sascha Mombartz</SubTitle>
          <Photo src="/static/images/illustrations/sascha.jpg" />
          <p>
            I am an artist and designer from no particular place. My work –
            multidisciplinary, spanning digital to physical – deals with the
            interaction between people and objects and questions our
            relationship with progress.
          </p>
          <small>
            <a href="http://mombartz.com/">Personal site</a>
            {' '}
-
            {' '}
            <a href="https://www.linkedin.com/in/smombartz/">LinkedIn</a>
          </small>
        </Column>
      </ThreeColumns>
    </Section>

    <Section>
      <Title>News</Title>
      <News>
        <p>July 2018</p>
        <p>
          We received $1.7M in funding from the following investors: General
          Catalyst and by Cherry Ventures and with participations from Consensys
          Ventures, Kindred Ventures, Betaworks, 122 West, La Famiglia, Coinbase
          Ventures and a group of stellar business angels.
          <a href="https://medium.com/unlock-protocol/unlocking-some-exciting-news-5ad0f3889375">
            More...
          </a>
          {' '}
        </p>
      </News>
    </Section>

    <Section>
      <CallToAction>
        Check out our open source code on
        <a href="https://github.com/unlock-protocol/unlock">GitHub</a>
, come
        work
        <a href="/jobs">with us</a>
        {' '}
or simply
        <a href="mailto:hello@unlock-protocol.com">get in touch</a>
.
      </CallToAction>
    </Section>
  </Layout>
)

export default About

const Photo = styled.img`
  width: 160px;
  border-radius: 4px;
`

const News = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 16px;
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  fonts-size: 22px;
  line-height: 1.5;
  color: var(--darkgrey);
`
