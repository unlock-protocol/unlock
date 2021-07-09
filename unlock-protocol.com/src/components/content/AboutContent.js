import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'

import {
  Section,
  Title,
  Headline,
  // SubTitle,
  Column,
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
          For this, we&#39;re building a protocol which lets anyone sell
          memberships to their work and for consumers to earn points when they
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
    {/* <Section>
      <Title>Team</Title>
      <Headline>
        Our work matters. We are building a healthier web ecosystem. If this is
        something that you would like to help us with, please,{' '}
        <Link href="/jobs">
          <a>join us!</a>
        </Link>
      </Headline>
      <Columns>
        {People.map((person) => {
          return <Person {...person} key={person.name} />
        })}
      </Columns>
    </Section> */}
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
