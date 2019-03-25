/* eslint-disable no-console */

const { join, resolve } = require('path')
const { generateBlogIndexFile, generateBlogFeed } = require('../src/utils/blog')

const dir = join(resolve(__dirname, '..'), 'src/')

generateBlogIndexFile(dir, generateBlogFeed(dir))

console.log('Blog index file generated')
