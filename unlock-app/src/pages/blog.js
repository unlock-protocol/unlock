import React from 'react'
import Head from 'next/head'
import styled from 'styled-components'

import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'
import BlogIndex from '../components/content/BlogIndex'
import { prepareBlogProps } from '../utils/blogLoader'

const Blog = ({ posts }) => {
  const title = 'Blog'
  const description = 'News and updates from the Unlock Protocol team.'

  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle(title)}</title>
        <TwitterTags title={title} description={description} />
        <OpenGraphTags
          title={pageTitle(title)}
          description={description}
          canonicalPath="/blog"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/static/blog.rss"
        />
      </Head>
      <Title>Unlock Blog</Title>
      <BlogIndex posts={posts} />
    </Layout>
  )
}

Blog.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

Blog.getInitialProps = async () => {
  // Showing 10 posts on the blog page
  return await prepareBlogProps(10)
}

export default Blog

const Title = styled.h1`
  margin-bottom: 0;
  color: var(--darkgrey);
  font-weight: 700;
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  font-size: 36px;
`
