const fs = require('fs')
const { join } = require('path')
const yamlFront = require('yaml-front-matter')
const Rss = require('rss')

/**
 * Master function that takes a base directory and returns a reverse-chronologically ordered list of blog posts,
 * as derived from markdown files
 * @param baseDir
 * @returns {Array}
 */
const generateBlogFeed = (basedir) => {
  // Find blog posts to export and render them as static pages (*.md files in the /blog folder)
  const blogDir = join(basedir, 'blog')
  const posts = fs.readdirSync(blogDir)
  const postFeed = [] // We will use this to populate the homepage and (later) an RSS feed

  // Establish a page route for each valid blog post
  posts.forEach((postFile) => {
    if (postFile.substr(-3) === '.md') {
      const slug = postFile.substr(0, postFile.length - 3)

      // Cache post metadata for feed; used in blog homepage and eventually RSS
      const post = yamlFront.loadFront(fs.readFileSync(join(blogDir, postFile)))
      post.slug = slug
      delete post.__content // We don't need to store the content of the post here

      postFeed.push(post)
    }
  })

  // Ensure posts are sorted in reverse chronological order for the index
  postFeed.sort((a, b) => {
    return Date.parse(b.publishDate) - Date.parse(a.publishDate)
  })

  return postFeed
}

/**
 * Given an array of blog posts, returns an array suitable for merging with the page map in next.config.js
 * @param postFeed
 * @returns {Array}
 */
const generatePostPages = (postFeed) => {
  const pages = {}

  postFeed.forEach((postFile) => {
    pages[`/blog/${postFile.slug}`] = {
      page: '/post',
      query: { slug: postFile.slug },
    }
  })

  return pages
}

/**
 * Given an array of blog posts, saves a static file to blog.json that will be used by the blog index
 * @param baseDir
 * @param postFeed
 */
const generateBlogIndexFile = (baseDir, postFeed, callback) => {
  const filePath = join(baseDir, 'blog', 'blog.index')
  // Write blog post index to output baseDirectory
  fs.writeFile(filePath, JSON.stringify({ items: postFeed }), callback)
}

/**
 * This function generates the URL for each paginated page
 */
const generateBlogPages = (numberOfPosts, postsPerPage) => {
  const pages = {}

  const numberOfPages = Math.ceil(numberOfPosts / postsPerPage)

  for (let i = 0; i < numberOfPages; i += 1) {
    pages[`/blog/${i + 1}`] = {
      page: '/blog',
      query: { slug: `${i + 1}` },
    }
  }
  return pages
}

/**
 * Saves an RSS file based on an array of blog posts
 * @param baseDir
 * @param postFeed
 * @param unlockUrl
 */
const generateRSSFile = (baseDir, postFeed, unlockUrl, callback) => {
  // Build list of items that don't have future publish dates

  const rssFeed = new Rss({
    title: 'Unlock Blog',
    description: "News and updates from the Web's new business model.",
    site_url: `${unlockUrl}/blog`,
    feed_url: `${unlockUrl}/blog.rss`,
    generator: 'Unlock Blog Engine',
  })

  postFeed.forEach((post) => {
    if (!post.draft) {
      rssFeed.item({
        title: post.title,
        description: post.description,
        url: `${unlockUrl}/blog/${post.slug}`,
        author: post.authorName,
        date: Date.parse(post.publishDate),
      })
    }
  })

  fs.writeFile(
    join(baseDir, 'public', 'blog.rss'),
    rssFeed.xml({ indent: true }),
    callback
  )
}

/**
 * Given a blog post directory, returns a set of page routes of posts, suitable for using with next.config.js
 * @param dir
 * @param pages
 * @returns {}
 */
const addBlogPagesToPageObject = (dir, pages) => {
  const blogFeed = generateBlogFeed(dir)
  const postPages = generatePostPages(blogFeed)
  const blogPages = generateBlogPages(blogFeed.length, 10)
  return { ...pages, ...postPages, ...blogPages }
}

module.exports = {
  generateBlogFeed,
  generatePostPages,
  generateBlogPages,
  generateBlogIndexFile,
  generateRSSFile,
  addBlogPagesToPageObject,
}
