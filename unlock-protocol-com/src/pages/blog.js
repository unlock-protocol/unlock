import PropTypes from 'prop-types'
import React from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import Link from 'next/link'

import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'
import BlogIndex from '../components/content/BlogIndex'
import { prepareBlogProps } from '../utils/blogLoader'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'
import { SignupBox } from '../components/interface/LandingPageComponents'

// TODO move to BlogContent
const Blog = ({ posts, page, totalPages }) => {
  let title = 'Blog'
  if (page > 1) {
    title += ` - Page ${page}`
  }
  const description = 'News and updates from the Unlock Protocol team.'

  return (
    <GlobalWrapper>
      <Layout forContent>
        <Head>
          <title>{pageTitle(title)}</title>
          <TwitterTags title={title} description={description} />
          <OpenGraphTags
            title={pageTitle(title)}
            description={description}
            canonicalPath="/blog"
          />
          <link rel="alternate" type="application/rss+xml" href="/blog.rss" />
        </Head>
        <Title>Unlock Blog</Title>
        <BlogIndex posts={posts} />
        <Pagination>
          {page > 1 && (
            <Left>
              <Link href="/blog/">
                <a>← First Page</a>
              </Link>
            </Left>
          )}
          {page > 2 && (
            <Left>
              <Link href={`/blog/${page - 1}`}>
                <a>│ Previous</a>
              </Link>
            </Left>
          )}
          {page !== totalPages && (
            <Right>
              <Link href={`/blog/${totalPages}`}>
                <a>Last Page →</a>
              </Link>
            </Right>
          )}
          {totalPages > page + 1 && (
            <Right>
              <Link href={`/blog/${page + 1}`}>
                <a>Next │</a>
              </Link>
            </Right>
          )}
        </Pagination>

        <SignupBox>
          <p style={{ marginTop: '16px', marginBottom: '0px' }}>
            Or use our{' '}
            <a
              style={{ color: 'white', textDecoration: 'underline' }}
              href="/blog.rss"
            >
              RSS feed
            </a>
          </p>
        </SignupBox>
      </Layout>
    </GlobalWrapper>
  )
}

Blog.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
}

Blog.getInitialProps = async (context) => {
  const { slug } = context.query // The slug is the page number
  return prepareBlogProps(10, parseInt(slug, 10))
}

export default Blog

const Title = styled.h1`
  margin-bottom: 0;
  color: var(--darkgrey);
  font-weight: 700;
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  font-size: 36px;
`

const Pagination = styled.ul`
  margin: 0px;
  margin-bottom: 120px;
  padding: 0px;
  li {
    display: inline-block;
    padding: 1px;
  }
`
const Left = styled.li`
  float: left;
`

const Right = styled.li`
  float: right;
`
