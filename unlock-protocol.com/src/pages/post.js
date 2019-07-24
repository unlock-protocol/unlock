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
  let title = post.title || ''
  let subTitle = post.subTitle || ''
  let description = post.description || ''
  let authorName = post.authorName || 'Unlock team'
  let publishDate = post.publishDate || ''
  let paywallLock = post.paywallLock || ''
  let body = post.__content || ''
  let membersOnly = post.membersOnly || ''
  let nonMembersOnly = post.nonMembersOnly || ''
  let permalink = '/blog/' + slug

  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle(title)}</title>
        <TwitterTags title={pageTitle(title)} description={description} />
        <OpenGraphTags
          title={pageTitle(title)}
          description={description}
          canonicalPath={permalink}
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
        title={title}
        subTitle={subTitle}
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
  return await preparePostProps(slug)
}

export default Post
