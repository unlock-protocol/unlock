/* eslint no-console: 0 */

const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const withTypescript = require('@zeit/next-typescript')
const yamlFront = require('yaml-front-matter')

const copyFile = promisify(fs.copyFile)

// TODO renames these: URLs need to be URLs, hosts need to be hosts... etc
let requiredConfigVariables = {
  unlockEnv: process.env.UNLOCK_ENV || 'dev',
  httpProvider: process.env.HTTP_PROVIDER || '127.0.0.1',
  paywallUrl: process.env.PAYWALL_URL,
  paywallScriptUrl: process.env.PAYWALL_SCRIPT_URL,
  readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  locksmithHost: process.env.LOCKSMITH_URI || 'http://127.0.0.1:8080',
  unlockAddress:
    process.env.UNLOCK_ADDRESS || '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93', // default for CI
}

// If the URL is set in an env variable, use it - otherwise it'll be overridden in config.js
if (process.env.UNLOCK_URL)
  requiredConfigVariables.unlockUrl = process.env.UNLOCK_URL

Object.keys(requiredConfigVariables).forEach(configVariableName => {
  if (!requiredConfigVariables[configVariableName]) {
    if (requiredConfigVariables.unlockEnv === 'test') return
    if (requiredConfigVariables.unlockEnv === 'dev') {
      return console.error(
        `The configuration variable ${configVariableName} is falsy.`
      )
    }
    throw new Error(
      `The configuration variable ${configVariableName} is falsy.`
    )
  }
})

module.exports = withTypescript({
  publicRuntimeConfig: requiredConfigVariables,
  webpack(config) {
    return config
  },
  exportPathMap: async (defaultPathMap, { dev, dir, outDir }) => {
    // Export robots.txt and humans.txt in non-dev environments
    if (!dev && outDir) {
      await copyFile(
        join(dir, 'static', 'robots.txt'),
        join(outDir, 'robots.txt')
      )
      await copyFile(
        join(dir, 'static', 'humans.txt'),
        join(outDir, 'humans.txt')
      )

      // Export _redirects which is used by netlify for URL rewrites
      await copyFile(
        join(dir, 'static', '_redirects'),
        join(outDir, '_redirects')
      )
    }

    // Our statically-defined pages to export
    let pages = {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/jobs': { page: '/jobs' },
      '/dashboard': { page: '/dashboard' },
      '/paywall': { page: '/paywall' },
      '/demo': { page: '/demo' },
      '/terms': { page: '/terms' },
      '/privacy': { page: '/privacy' },
      '/log': { page: '/log' },
      '/post': { page: '/post' },
      '/blog': { page: '/blog' },
    }

    // Find blog posts to export and render them as static pages (*.md files in the /blog folder)
    let posts = fs.readdirSync(join(dir, 'static', 'blog'))
    let postFeed = [] // We will use this to populate the homepage and (later) an RSS feed

    // Ensure posts are sorted in reverse chronological order for the index
    posts.sort(function(a, b) {
      return (
        fs.statSync(dir + b).mtime.getTime() -
        fs.statSync(dir + a).mtime.getTime()
      )
    })

    // Establish a page route for each valid blog post
    posts.forEach(postFile => {
      if (postFile.substr(-3) === '.md') {
        let slug = postFile.substr(0, postFile.length - 3)

        pages['/blog/' + slug] = {
          page: '/post',
          query: { slug: slug },
        }

        // Cache post metadata for feed; used in blog homepage and eventually RSS
        let post = yamlFront.loadFront(
          fs.readFileSync(join(dir, 'static', 'blog', postFile))
        )
        post.slug = slug
        postFeed.push(post)
      }
    })

    // Write blog post index to output directory
    fs.writeFile(
      join(dir, 'static', 'blog.json'),
      JSON.stringify({ items: postFeed }),
      'utf8'
    )

    return pages
  },
})
