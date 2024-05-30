const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch')
const feedparser = require('feedparser-promised')

// Fetch the RSS feed
const rssUrl = 'https://paragraph.xyz/api/blogs/rss/@unlockprotocol'
//const rssUrl = 'https://gist.githubusercontent.com/njokuScript/49c95765a21de9a7cf01c72f06149769/raw/5f62f27fc2a9c37e992d7834e86361a72cbfeeca/mock_rss_feed.xml'

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

const downloadImage = (url, filepath) => {
  return fetch(url)
    .then((res) => res.buffer())
    .then((buffer) => fs.writeFile(filepath, buffer))
    .catch((error) => console.error(`Error downloading image ${url}:`, error))
}

const extractAndDownloadImages = (content, postImagesDir, slug) => {
  const imageRegex = /<img[^>]+src="([^">]+)"/g
  let updatedContent = content
  let match
  const imagePromises = []

  while ((match = imageRegex.exec(content)) !== null) {
    const imageUrl = match[1]
    const imageFilename = path.basename(imageUrl)
    const localImagePath = path.join(postImagesDir, imageFilename)
    // Extract and download images from the content and update the content with local image paths
    const imagePromise = downloadImage(imageUrl, localImagePath).then(() => {
      updatedContent = updatedContent.replace(
        imageUrl,
        `/images/blog/${slug}/${imageFilename}`
      )
    })
    imagePromises.push(imagePromise)
  }

  return Promise.all(imagePromises).then(() => updatedContent)
}
// Iterate over each post in the feed
feedparser
  .parse(rssUrl)
  .then((entries) => {
    entries.forEach((entry, count) => {
      const title = entry.title
      const subtitle = entry.subtitle || ''
      const authorName = entry.author || 'Unlock Labs team'
      const publishDate = entry.pubDate
      const description = entry.summary
      let imageUrl = entry.image && entry.image.href ? entry.image.href : ''

      if (!imageUrl) {
        const enclosuresImage = entry.enclosures.find((enclosure) => {
          return enclosure.type.startsWith('image')

        })
        if (enclosuresImage) {
          imageUrl = enclosuresImage.url
        }
      }

      // Skip if the title already exists
      if (existingTitles.has(title)) {
        return
      }
      // Generate a slug for the blog post
      const slug = title
        .replace(/[^\w\-_\. ]/g, '-')
        .toLowerCase()
        .replace(/ /g, '-')
      const postImagesDir = path.join(
        '../../../unlock-protocol-com/public/images/blog',
        slug
      )
      fs.ensureDirSync(postImagesDir)
      // Download the featured image and save it locally
      let imageDownloadPromise = Promise.resolve()
      if (imageUrl) {
        const imageFilename = path.basename(imageUrl)
        const localImagePath = path.join(postImagesDir, imageFilename)
        imageDownloadPromise = downloadImage(imageUrl, localImagePath)
      }

      // Create the post content with the updated content
      imageDownloadPromise
        .then(() => {
          return extractAndDownloadImages(
            entry.description,
            postImagesDir,
            slug
          )
        })
        .then((updatedContent) => {
          const postContent = `---
title: "${title}"
subtitle: "${subtitle}"
authorName: "${authorName}"
publishDate: "${publishDate}"
description: "${description}"
image: "/images/blog/${slug}/${path.basename(
            imageUrl
          )}"
---

![${title}](${imageUrl})

${updatedContent}`

          const postFilename = `${slug}.md`
          const postFilePath = path.join(blogDir, postFilename)
          fs.writeFileSync(postFilePath, postContent)
          existingTitles.add(title)
        })
    })
  })
  .catch((error) => {
    console.error('Error fetching RSS feed:', error)
  })
