import React from 'react'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'

import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import BlogPost from '../components/content/BlogPost'
import { pageTitle } from '../constants'
import { TwitterTags } from '../components/page/TwitterTags'
import OpenGraphTags from '../components/page/OpenGraphTags'
import configure from '../config'
import withConfig from '../utils/withConfig'

const yamlFront = require('yaml-front-matter')

const Post = ({ slug, post, config }) => {
  let title = post.title || ''
  let subTitle = post.subTitle || ''
  let description = post.description || ''
  let authorName = post.authorName || 'Unlock team'
  let publishDate = post.publishDate || ''
  let body = post.__content || ''
  let permalink = config.unlockUrl + '/blog/' + slug

  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle(title)}</title>
        <TwitterTags title={title} description={description} />
        <OpenGraphTags
          title={pageTitle(title)}
          description={description}
          canonicalPath={'/blog/' + slug}
        />
      </Head>
      <BlogPost
        body={body}
        publishDate={publishDate}
        title={title}
        subTitle={subTitle}
        authorName={authorName}
        permalink={permalink}
      />
    </Layout>
  )
}

Post.propTypes = {
  slug: UnlockPropTypes.slug.isRequired,
  post: UnlockPropTypes.post.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

Post.getInitialProps = async context => {
  const { slug } = context.query
  const { unlockUrl } = configure()

  // Next.js will cache this result and turn the page into a static page. The payload will not be reloaded on the client.
  const fileContents = await (await fetch(
    unlockUrl + '/static/blog/' + slug + '.md'
  )).text()
  const post = yamlFront.loadFront(fileContents)

  return { slug, post }
}

export default withConfig(Post)
