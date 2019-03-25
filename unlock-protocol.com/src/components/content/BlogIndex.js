import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import { AuthorName, PublishDate } from './BlogPost'

export const BlogIndex = ({ posts }) => (
  <Index>
    {posts.map(({ title, authorName, publishDate, slug, description }) => (
      <Post key={slug}>
        <Title>
          <Link href={'/blog/' + slug}>
            <a>{title}</a>
          </Link>
        </Title>
        <Byline>
          <AuthorName>{authorName}</AuthorName>
          <PublishDate>{publishDate}</PublishDate>
        </Byline>
        <Description>{description}</Description>
      </Post>
    ))}
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
  a {
    color: var(--darkgrey);
    font-weight: 700;
    font-family: 'IBM Plex Sans', Helvetica, sans-serif;
    font-size: 20px;
  }
`

const Byline = styled.div`
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  color: var(--darkgrey);
  font-size: 12px;
  line-height: 12px;
  margin-top: 0;
`

const Description = styled.div`
  color: var(--darkgrey);
  font-weight: 300;
  line-height: 28px;
  font-size: 16px;
`

const Post = styled.div`
  margin-bottom: 20px;
`
