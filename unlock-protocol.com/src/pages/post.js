import React from 'react'
import Head from 'next/head'

import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import BlogPost from '../components/content/BlogPost'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'
import { preparePostProps } from '../utils/blogLoader'
import PaywallTags from '../components/page/PaywallTags'

// TODO: move to PostContent
const Post = ({ slug, post }) => {
  const title = post.title || ''
  const subTitle = post.subTitle || ''
  const description = post.description || ''
  const authorName = post.authorName || 'Unlock team'
  const publishDate = post.publishDate || ''
  const latestUpdateDate = post.latestUpdateDate || ''
  const paywallLock = post.paywallLock || ''
  /* eslint-disable no-underscore-dangle */
  const body = post.__content || ''
  const membersOnly = post.membersOnly || ''
  const nonMembersOnly = post.nonMembersOnly || ''
  const scripts = post.scripts || []
  const permalink = `/blog/${slug}`
  const { image } = post

  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle(title)}</title>
        <TwitterTags
          title={pageTitle(title)}
          description={description}
          image={image}
        />
        <OpenGraphTags
          title={pageTitle(title)}
          description={description}
          canonicalPath={permalink}
          image={image}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/static/blog.rss"
        />
        <PaywallTags lock={paywallLock} />
      </Head>
      <BlogPost
        body={body}
        publishDate={publishDate}
        latestUpdateDate={latestUpdateDate}
        title={title}
        subTitle={subTitle}
        scripts={scripts}
        authorName={authorName}
        permalink={permalink}
        membersOnly={membersOnly}
        nonMembersOnly={nonMembersOnly}
      />
    </Layout>
  )
}

Post.propTypes = {
  slug: UnlockPropTypes.slug.isRequired,
  post: UnlockPropTypes.post.isRequired,
}

Post.getInitialProps = async context => {
  const { slug } = context.query
  return preparePostProps(slug)
}

export default Post
