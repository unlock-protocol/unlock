import { Feed } from 'feed'
import type { PostType } from './posts'
import { baseURL, SOCIAL_URL } from '../config/seo'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function generateFeed(posts: PostType[]) {
  const siteURL = baseURL!
  const date = new Date()

  const feed = new Feed({
    title: 'Unlock Blog',
    description: 'Latest updates from unlock team',
    id: siteURL,
    link: siteURL,
    image: new URL('favicon.svg', siteURL).toString(),
    copyright: `All rights reserved ${date.getFullYear()}, Unlock Inc.`,
    updated: date,
    feedLinks: {
      rss2: new URL('feed.xml', siteURL),
      json: new URL('feed.json', siteURL).toString(),
      atom: new URL('feed.atom', siteURL).toString(),
    },
    author: {
      name: 'Unlock Team',
      email: 'hello@unlock-protocol.com',
      link: SOCIAL_URL.twitter,
    },
  })

  for (const post of posts) {
    const url = new URL(`/blog/${post.slug}`, siteURL).toString()
    if (post.frontMatter.publishDate) {
      feed.addItem({
        title: post.frontMatter.title,
        id: url,
        link: url,
        description: post.frontMatter.subTitle,
        content: post.htmlContent,
        author: [
          {
            name: post.frontMatter.authorName,
          },
        ],
        contributor: [
          {
            name: post.frontMatter.authorName,
          },
        ],
        date: new Date(post.frontMatter.publishDate),
      })
    }
  }

  await writeFile(path.join('public', 'blog.rss'), feed.atom1())
}
