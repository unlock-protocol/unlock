/* eslint-disable no-console */

const { resolve } = require('path')
const { generateBlogIndexFile, generateBlogFeed } = require('../src/utils/blog')

const dir = resolve(__dirname, '..')

generateBlogIndexFile(dir, generateBlogFeed(dir))

console.log('Blog index file generated')
