import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import Svg from '../interface/svg'
import {
  H2,
  ActionButtons,
  ActionButton,
  Box,
  Column,
  Icon,
} from '../interface/LandingPageComponents'

import {
  Section,
  Title,
  Headline,
  // SubTitle,
  // Column,
  TwoColumns,
} from '../Components'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import OpenGraphTags from '../page/OpenGraphTags'
import UnlockPropTypes from '../../propTypes'

const Post = ({ publishDate, description, slug }) => (
  <>
    <p>{publishDate}</p>
    <p>
      {description}
      &nbsp;
      <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer">
        More...
      </a>
    </p>
  </>
)

Post.propTypes = {
  publishDate: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
}

// const People = [
//   {
//     name: 'Julien Genestoux',
//     picture: '/static/images/illustrations/julien.jpg',
//     personalLink: 'https://www.ouvre-boite.com/',
//     linkedIn: 'https://www.linkedin.com/in/juliengenestoux/',
//     bio: `I am an entrepreneur and a software engineer. I am a vocal web
//             advocate who co-authored the W3C WebSub protocol. I sold my previous
//             company, Superfeedr, an RSS feed API, to Medium. Born in France, I
//             currently live in Brooklyn.`,
//   },
//   {
//     name: 'Sascha Mombartz',
//     picture: '/static/images/illustrations/sascha.jpg',
//     personalLink: 'http://mombartz.com/',
//     linkedIn: 'https://www.linkedin.com/in/smombartz/',
//     bio: `I am an artist and designer from no particular place. My work –
//             multidisciplinary, spanning digital to physical – deals with the
//             interaction between people and objects and questions our
//             relationship with progress.`,
//   },
// ].sort((bonnie, clyde) => (bonnie.name < clyde.name ? -1 : 1))

// const Person = ({ name, picture, personalLink, linkedIn, bio }) => (
//   <Column>
//     <SubTitle>{name}</SubTitle>
//     <Photo src={picture} />
//     <p>{bio}</p>
//     <small>
//       <a href={personalLink} target="_blank" rel="noopener noreferrer">
//         Personal site
//       </a>
//       {linkedIn && (
//         <span>
//           &nbsp;-&nbsp;
//           <a href={linkedIn} target="_blank" rel="noopener noreferrer">
//             LinkedIn
//           </a>
//         </span>
//       )}
//     </small>
//   </Column>
// )

// Person.propTypes = {
//   name: PropTypes.string.isRequired,
//   picture: PropTypes.string.isRequired,
//   personalLink: PropTypes.string.isRequired,
//   linkedIn: PropTypes.string.isRequired,
//   bio: PropTypes.string.isRequired,
// }

export const AboutContent = ({ posts }) => (
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
        Unlock is an open source, Ethereum-based protocol designed to streamline
        membership benefits for online communities.
      </Headline>
      <TwoColumns>
        <Column>
          Unlock is meant to help creators find ways to monetize without relying
          on a middleman. It’s a protocol — and not a centralized platform that
          controls everything that happens on it.
          <br />
          <br />
          Unlock’s mission is about taking back subscription and access from the
          domain of middlemen — from a million tiny silos and a handful of
          gigantic ones — and transforming it into a fundamental business model
          for the web.
        </Column>
        <Column>
          The Unlock Protocol can be applied to publishing (paywalls),
          newsletters, software licenses or even the physical world, such as
          transportation systems. The web revolutionized all of these areas -
          Unlock will make them economically viable.
        </Column>
      </TwoColumns>
    </Section>

    <Box
      color="var(--white)"
      style={{ textAlign: 'center', marginBottom: '48px' }}
    >
      <H2 style={{ marginBottom: '32px' }}>
        We are commmunity built and governed
      </H2>
      <p style={{ width: '75%', margin: 'auto' }}>
        Join the 500+ community of developers, creators and governants building
        the future of Unlock!
      </p>

      <ActionButtons style={{ justifyContent: 'center', marginTop: '32px' }}>
        <ActionButton
          target="_blank"
          href="https://discord.gg/Ah6ZEJyTDp"
          color="#5865F2"
          contrastColor="var(--white)"
        >
          <Icon size="36">
            <Svg.Discord />
          </Icon>
          Discord
        </ActionButton>
        <ActionButton
          target="_blank"
          href="https://unlock.community/"
          color="#4A4A4A"
          contrastColor="var(--white)"
        >
          <Icon size="36">
            <Svg.Discourse />
          </Icon>
          Forum
        </ActionButton>
        <ActionButton
          target="_blank"
          href="https://twitter.com/unlockprotocol"
          color="#1DA1F2"
          contrastColor="var(--white)"
        >
          <Icon size="36">
            <Svg.Twitter />
          </Icon>
          Twitter
        </ActionButton>
        <ActionButton
          target="_blank"
          href="https://vote.unlock-protocol.com/#/unlock-protocol.eth"
          color="var(--brand)"
          contrastColor="var(--white)"
        >
          <Icon size="36">
            <Svg.Key />
          </Icon>
          Governance
        </ActionButton>
      </ActionButtons>
    </Box>
    <Section>
      <Title>News</Title>
      <News>
        {posts.map((story) => {
          return <Post {...story} key={story.slug} />
        })}
      </News>
    </Section>
  </Layout>
)

AboutContent.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

export default AboutContent

// const Photo = styled.img`
//   width: 160px;
//   border-radius: 4px;
// `

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
