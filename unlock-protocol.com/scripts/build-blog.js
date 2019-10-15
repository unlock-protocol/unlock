/* eslint-disable no-console */

const { resolve } = require('path')
const { generateBlogIndexFile, generateBlogFeed } = require('../src/utils/blog')

const dir = resolve(__dirname, '..')

generateBlogIndexFile(dir, generateBlogFeed(dir), error => {
  if (error) {
    console.error('Failed to generate blog file')
    console.error(error)
    process.exit(1)
  }
  console.log('Blog index file generated')
})
