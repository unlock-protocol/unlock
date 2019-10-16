/* eslint-disable no-console */

const { resolve } = require('path')
const {
  generateBlogIndexFile,
  generateBlogFeed,
  generateRSSFile,
} = require('../src/utils/blog')

const dir = resolve(__dirname, '..')
const blogFile = generateBlogFeed(dir)
generateBlogIndexFile(dir, blogFile, error => {
  if (error) {
    console.error('Failed to generate blog file')
    console.error(error)
    process.exit(1)
  }
  console.log('Blog index file generated')
})
const unlockUrl = process.env.UNLOCK_URL || 'https://unlock-protocol.com'

generateRSSFile(dir, blogFile, unlockUrl, error => {
  if (error) {
    console.error('Failed to generate rss file')
    console.error(error)
    process.exit(1)
  }

  console.log('Blog RSS file generated')
})
