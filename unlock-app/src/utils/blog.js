const fs = require('fs')
const { join } = require('path')
const yamlFront = require('yaml-front-matter')

/**
 * Master function that takes a base directory and returns a reverse-chronologically ordered list of blog posts,
 * as derived from markdown files
 * @param baseDir
 * @returns {Array}
 */
const generateBlogFeed = baseDir => {
  // Find blog posts to export and render them as static pages (*.md files in the /blog folder)
  let posts = fs.readdirSync(join(baseDir, 'static', 'blog'))
  let postFeed = [] // We will use this to populate the homepage and (later) an RSS feed

  // Establish a page route for each valid blog post
  posts.forEach(postFile => {
    if (postFile.substr(-3) === '.md') {
      let slug = postFile.substr(0, postFile.length - 3)

      // Cache post metadata for feed; used in blog homepage and eventually RSS
      let post = yamlFront.loadFront(
        fs.readFileSync(join(baseDir, 'static', 'blog', postFile))
      )
      post.slug = slug
      delete post.__content // We don't need to store the content of the post here

      postFeed.push(post)
    }
  })

  // Ensure posts are sorted in reverse chronological order for the index
  postFeed.sort(function(a, b) {
    return Date.parse(b.publishDate) - Date.parse(a.publishDate)
  })

  return postFeed
}

/**
 * Given an array of blog posts, returns an array suitable for merging with the page map in next.config.js
 * @param postFeed
 * @returns {Array}
 */
const generateBlogPages = postFeed => {
  let pages = []

  postFeed.forEach(postFile => {
    pages['/blog/' + postFile.slug] = {
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
const generateBlogIndexFile = (baseDir, postFeed) => {
  // Write blog post index to output baseDirectory
  fs.writeFile(
    join(baseDir, 'static', 'blog.json'),
    JSON.stringify({ items: postFeed }),
    'utf8'
  )
}

/**
 * Given a blog post directory, returns a set of page routes of posts, suitable for using with next.config.js
 * @param dir
 * @param pages
 * @returns {}
 */
const addBlogPagesToPageObject = (dir, pages) => {
  let blogFeed = generateBlogFeed(dir)
  let blogPages = generateBlogPages(blogFeed)

  return { ...pages, ...blogPages }
}

module.exports = {
  generateBlogFeed,
  generateBlogPages,
  generateBlogIndexFile,
  addBlogPagesToPageObject,
}
