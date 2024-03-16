import fs from 'fs-extra'
import path from 'path'
import fetch from 'node-fetch'
import feedparser from 'feedparser-promised'

// Fetch the RSS feed
const rssUrl = 'https://paragraph.xyz/api/blogs/rss/@unlockprotocol'
// Mock RSS URL
// const rssUrl =
//   'https://gist.githubusercontent.com/njokuScript/49c95765a21de9a7cf01c72f06149769/raw/5f62f27fc2a9c37e992d7834e86361a72cbfeeca/mock_rss_feed.xml'

// Create the base directory for storing blog posts
const blogDir = '../../../unlock-protocol-com/blog'
fs.ensureDirSync(blogDir)

// Load the titles of existing blog posts to check for duplicates
const existingTitles = new Set()
fs.readdirSync(blogDir).forEach((filename) => {
  if (filename.endsWith('.md')) {
    const content = fs.readFileSync(path.join(blogDir, filename), 'utf8')
    const titleMatch = content.match(/^title: "(.*)"/m)
    if (titleMatch) {
      existingTitles.add(titleMatch[1])
    }
  }
})

// Iterate over each post in the feed
feedparser
  .parse(rssUrl)
  .then((entries) => {
    entries.forEach((entry) => {
      // Extract post details
      const title = entry.title
      const subtitle = entry.subtitle || ''
      const authorName = entry.author
      const publishDate = entry.pubDate
      const description = entry.summary
      const imageUrl = entry.image && entry.image.href ? entry.image.href : ''

      // Skip if the title already exists
      if (existingTitles.has(title)) {
        return
      }

      // Generate a slug for the blog post
      const slug = title
        .replace(/[^\w\-_\. ]/g, '_')
        .toLowerCase()
        .replace(/ /g, '_')

      // Create a directory for the blog post images
      const postImagesDir = path.join(
        '../../../unlock-protocol-com/public/images/blog',
        slug
      )
      fs.ensureDirSync(postImagesDir)

      // Fetch and save the image locally
      let localImagePath = ''
      if (imageUrl) {
        const imageFilename = path.basename(imageUrl)
        localImagePath = path.join(postImagesDir, imageFilename)
        fetch(imageUrl)
          .then((res) => res.buffer())
          .then((buffer) => fs.writeFileSync(localImagePath, buffer))
      }

      // Create the post content
      const postContent = `---
title: "${title}"
subtitle: "${subtitle}"
authorName: "${authorName}"
publishDate: "${publishDate}"
description: "${description}"
image: "../../../unlock-protocol-com/public/images/blog_mock/${slug}/${path.basename(
        imageUrl
      )}"
---

${entry.description}`

      // Generate the filename for the blog post
      const postFilename = `${slug}.md`
      const postFilePath = path.join(blogDir, postFilename)

      // Save the post to a file
      fs.writeFileSync(postFilePath, postContent)

      // Add the title to the set of existing titles
      existingTitles.add(title)
    })
  })
  .catch((error) => {
    console.error('Error fetching RSS feed:', error)
  })
