import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import { AuthorName, PublishDate, Byline } from './BlogPost'
import Media, { NoPhone } from '../../theme/media'

export const BlogIndex = ({ posts }) => (
  <Index>
    <Blurb>
      We’re building the new business model for the web that will empower
      creators and consumers.
    </Blurb>
    {posts.map(
      ({ title, authorName, publishDate, slug, description, image }) => (
        <Post key={slug}>
          <NoPhone>
            <Link href={'/blog/' + slug}>
              <a>
                <Image src={image} />
              </a>
            </Link>
          </NoPhone>
          <Details>
            <Title>
              <Link href={'/blog/' + slug}>
                <a>{title}</a>
              </Link>
            </Title>
            <Description>{description}</Description>
            <IndexByline>
              <AuthorName>{authorName}</AuthorName>&nbsp;
              <PublishDate>on {publishDate}</PublishDate>
            </IndexByline>
          </Details>
        </Post>
      )
    )}
  </Index>
)

BlogIndex.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

export default BlogIndex

const Index = styled.div`
  margin: auto;
  width: 100%;
  max-with: 750px;
`

const Title = styled.div`
  margin-bottom: 0;
  a,
  a:visited {
    color: var(--brand);
    font-weight: 700;
    font-family: 'IBM Plex Sans', Helvetica, sans-serif;
    font-size: 36px;
  }
`

const IndexByline = styled(Byline)`
  margin-top: 16px;
  margin-bottom: 0;
`

const Description = styled.div`
  color: var(--darkgrey);
  font-weight: 300;
  line-height: 28px;
  font-size: 16px;
  font-family: 'IBM Plex Serif';
`

const Post = styled.div`
  margin-bottom: 20px;
  ${Media.nophone`
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-gap: 32px;
  `};
  margin-bottom: 64px;
`

const Blurb = styled.div`
  font-family: 'IBM Plex Serif';
  font-weight: 300;
  font-size: 24px;
  margin-bottom: 66px;
  color: #59c245;
  max-width: 424px;
`

const Image = styled.img`
  max-width: 100%;
`

const Details = styled.div``
