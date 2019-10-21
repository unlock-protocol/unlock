/* eslint-disable no-console */

const { join, resolve } = require('path')
const { generateRSSFile, generateBlogFeed } = require('../src/utils/blog')

const dir = join(resolve(__dirname, '..'), 'src/')
const unlockUrl = process.env.UNLOCK_URL || 'https://unlock-protocol.com'

generateRSSFile(dir, generateBlogFeed(dir), unlockUrl, error => {
  if (error) {
    console.error('Failed to generate rss file')
    console.error(error)
    process.exit(1)
  }

  console.log('Blog RSS file generated')
})
