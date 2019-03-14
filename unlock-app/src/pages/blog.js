import React from 'react'
import Head from 'next/head'
import styled from 'styled-components'

import configure from '../config'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'
import BlogIndex from '../components/content/BlogIndex'

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
  const { unlockUrl } = configure()

  // Next.js will cache this result and turn the page into a static page. The payload will not be reloaded on the client.
  const response = await fetch(unlockUrl + '/static/blog.json', 10)
  const index = await response.json()

  let posts = []

  if (index.items) {
    // TODO: add pagination
    // For now we'll limit the blog homepage to 10 posts.
    posts = index.items.slice(0, 10)
  }

  return { posts: posts }
}

export default Blog

const Title = styled.h1`
  margin-bottom: 0;
  color: var(--darkgrey);
  font-weight: 700;
  font-family: 'IBM Plex Sans', Helvetica, sans-serif;
  font-size: 36px;
`
