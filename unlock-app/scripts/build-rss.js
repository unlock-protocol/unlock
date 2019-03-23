/* eslint-disable no-console */

const { join, resolve } = require('path')
const { generateRSSFile, generateBlogFeed } = require('../src/utils/blog')

const dir = join(resolve(__dirname, '..'), 'src/')
const unlockUrl = process.env.UNLOCK_URL || 'https://unlock-protocol.com'

generateRSSFile(dir, generateBlogFeed(dir), unlockUrl)

console.log('Blog RSS file generated')
