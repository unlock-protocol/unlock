import React from 'react'
import { Markdown } from 'react-showdown'
import styled from 'styled-components'
import PropTypes from 'prop-types'

export const BlogPost = ({
  title,
  subTitle,
  publishDate,
  body,
  authorName,
}) => (
  <Post>
    <Title>{title}</Title>
    {subTitle && <SubTitle>{subTitle}</SubTitle>}
    <Byline>
      <AuthorName>{authorName}</AuthorName>
      <PublishDate>{publishDate}</PublishDate>
    </Byline>
    <Body>
      <Markdown markup={body} />
    </Body>
  </Post>
)

BlogPost.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  body: PropTypes.string.isRequired,
  authorName: PropTypes.string,
  publishDate: PropTypes.string.isRequired,
}

BlogPost.defaultProps = {
  authorName: 'Unlock team',
  subTitle: '',
}

export default BlogPost

const Post = styled.div`
  width: 100%;
  max-width: 730px;
  margin: auto;
  font-family: 'IBM Plex Serif', serif;
`

const Title = styled.h1`
  margin-bottom: 0;
  a {
    color: var(--darkgrey);
    font-weight: 700;
    font-family: 'IBM Plex Sans', Helvetica, sans-serif;
    font-size: 36px;
  }
`

const Byline = styled.div`
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  color: var(--darkgrey);
  font-size: 12px;
  line-height: 12px;
  margin-top: 0;
  margin-bottom: 35px;
`

const SubTitle = styled.h2`
  margin-top: 10px;
  font-size: 18px;
  font-weight: 400;
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  color: var(--dimgrey);
`

const Body = styled.div`
  color: var(--darkgrey);
  font-weight: 300;
  line-height: 28px;
  font-size: 16px;

  strong {
    font-weight: 800;
  }

  p {
    margin-top: 0;
  }

  h2 {
    font-weight: 800;
    font-family: 'IBM Plex Sans', Helvetica, sans-serif;
    margin-bottom: 0;
    padding-bottom: 0;
    font-size: 18px;
  }

  img {
    max-width: 730px;
  }
`

export const AuthorName = styled.h3`
  color: var(--brand);
`

export const PublishDate = styled.div``
