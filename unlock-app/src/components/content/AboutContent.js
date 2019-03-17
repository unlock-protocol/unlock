import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import Signature from '../interface/Signature'
import {
  Section,
  Title,
  Headline,
  SubTitle,
  Column,
  TwoColumns,
  Columns,
} from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import OpenGraphTags from '../page/OpenGraphTags'

const Stories = [
  {
    date: new Date('2019-01-25'),
    summary:
      'We’re changing the business model for the web. It starts here, today. Introducing Unlock Version 0.',
    link:
      'https://medium.com/unlock-protocol/announcing-unlock-version-zero-a8a1ac8ea4ec',
  },
  {
    date: new Date('2018-12-14'),
    summary: `Using ads to support content creation is broken, whether from a purely technical or an
    economic standpoint. Aside from an ever-shrinking group of the largest platforms, most can only
    scrape a few cents per hour from ads.`,
    link:
      'https://medium.com/unlock-protocol/the-end-of-the-ad-supported-web-d4d093fb462f',
  },
  {
    date: new Date('2018-04-27T21:00:37.411Z'),
    summary: `The web needs a better business model - and we believe the technology is finally here
    to do it.`,
    link:
      'https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1',
  },
  {
    date: new Date('2018-07-23T21:00:37.411Z'),
    summary: `We received $1.7M in funding from the following investors: General Catalyst and by
    Cherry Ventures and with participations from Consensys Ventures, Kindred Ventures, Betaworks,
    122 West, La Famiglia, Coinbase Ventures and a group of stellar business angels.`,
    link:
      'https://medium.com/unlock-protocol/unlocking-some-exciting-news-5ad0f3889375',
  },
  {
    date: new Date('2018-10-15T17:17:51.940Z'),
    summary: `In a world where corporations control our conversations, removing middlemen is more
    important than ever.`,
    link:
      'https://medium.com/unlock-protocol/to-save-freedom-of-speech-we-must-decentralize-the-web-19b2eb92f3b8',
  },
].sort((first, last) => (first.date < last.date ? 1 : -1))

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const Post = ({ date, summary, link }) => (
  <React.Fragment>
    <p>
      {monthNames[date.getMonth()]}
      &nbsp;
      {date.getFullYear()}
    </p>
    <p>
      {summary}
      &nbsp;
      <a href={link} target="_blank" rel="noopener noreferrer">
        More...
      </a>
    </p>
  </React.Fragment>
)

Post.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  summary: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
}

const People = [
  {
    name: 'Julien Genestoux',
    picture: '/static/images/illustrations/julien.jpg',
    personalLink: 'https://www.ouvre-boite.com/',
    linkedIn: 'https://www.linkedin.com/in/juliengenestoux/',
    bio: `I am an entrepreneur and a software engineer. I am a vocal web
            advocate who co-authored the W3C WebSub protocol. I sold my previous
            company, Superfeedr, an RSS feed API, to Medium. Born in France, I
            currently live in Brooklyn.`,
  },
  {
    name: 'Ben Werdmuller',
    picture: '/static/images/illustrations/ben.jpg',
    personalLink: 'https://benwerd.com/',
    linkedIn: 'https://www.linkedin.com/in/benwerd/',
    bio: `I work at the intersection of technology, media, and democracy. I
            co-founded Elgg and Known, worked on Medium and Latakoo, and
            invested in innovative media startups to support a stronger
            democracy at Matter.`,
  },
  {
    name: 'Sascha Mombartz',
    picture: '/static/images/illustrations/sascha.jpg',
    personalLink: 'http://mombartz.com/',
    linkedIn: 'https://www.linkedin.com/in/smombartz/',
    bio: `I am an artist and designer from no particular place. My work –
            multidisciplinary, spanning digital to physical – deals with the
            interaction between people and objects and questions our
            relationship with progress.`,
  },
  {
    name: 'Akeem Adeniji',
    picture: '/static/images/illustrations/akeem.jpg',
    personalLink: 'http://akeemadeniji.com',
    linkedIn: 'https://www.linkedin.com/in/akeemadeniji',
    bio: `I'm a software engineer, comfortable wearing many hats, and
            excited to help build our future enabling people with technology.
            Prior to joining Unlock, I worked to launch and scale projects at
            Facebook.`,
  },
  {
    name: 'Gregory Beaver',
    picture: '/static/images/illustrations/greg.jpg',
    personalLink: 'https://gregorybeaver.com',
    linkedIn: 'https://www.linkedin.com/in/gbeaver/',
    bio: `I am a symbiotic organism, thriving in both music and the art of
          software development. 18 years as cellist of The Chiara Quartet, and now
          a soloist and composer matches equal experience in open source.`,
  },
  {
    name: 'Christopher Nascone',
    picture: '/static/images/illustrations/chris.jpg',
    personalLink: 'https://nasc.one',
    linkedIn: '',
    bio: `I'm a software engineer from New Jersey, which means I have only
          one degree of separation from the entire staff of Bell Labs. When I'm
          not on the computer, you might find me wandering around in the woods.`,
  },
].sort((bonnie, clyde) => (bonnie.name < clyde.name ? -1 : 1))

const Person = ({ name, picture, personalLink, linkedIn, bio }) => (
  <Column>
    <SubTitle>{name}</SubTitle>
    <Photo src={picture} />
    <p>{bio}</p>
    <small>
      <a href={personalLink} target="_blank" rel="noopener noreferrer">
        Personal site
      </a>
      {linkedIn && (
        <span>
          &nbsp;-&nbsp;
          <a href={linkedIn} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </span>
      )}
    </small>
  </Column>
)

Person.propTypes = {
  name: PropTypes.string.isRequired,
  picture: PropTypes.string.isRequired,
  personalLink: PropTypes.string.isRequired,
  linkedIn: PropTypes.string.isRequired,
  bio: PropTypes.string.isRequired,
}

export const AboutContent = () => (
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
      <Columns>
        {People.map(function(person) {
          return <Person {...person} key={person.name} />
        })}
      </Columns>
    </Section>
    <Section>
      <Title>News</Title>
      <News>
        {Stories.map(function(story) {
          return <Post {...story} key={story.date} />
        })}
      </News>
    </Section>
    <Signature />
  </Layout>
)

export default AboutContent

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
