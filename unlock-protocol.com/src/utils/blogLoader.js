import fetch from 'isomorphic-unfetch'

const yamlFront = require('yaml-front-matter')

/**
 * Given the URL of a blog index file, returns an array of posts
 * @param url
 * @param maxPosts
 * @returns {Promise<Array>}
 */
export const loadBlogIndexFile = async (url, maxPosts) => {
  const response = await fetch(url)

  let index
  try {
    index = await response.json()
  } catch (e) {
    index = {} // Just set up a default object
  }

  let posts = []

  if (index.items) {
    index.items.forEach(item => {
      if (Date.parse(item.publishDate) <= Date.now()) {
        posts.push(item)
      }
    })
    // TODO: add pagination
    posts = posts.slice(0, maxPosts)
  }

  return posts
}

/**
 * Loads a parsed blog post object from a markdown file location
 * @param url
 * @returns {Promise<{}>}
 */
export const loadBlogPost = async url => {
  const fileContents = await (await fetch(url)).text()
  return yamlFront.loadFront(fileContents)
}

/**
 * Given a page context, returns a slug and post object
 * @param context
 * @returns {Promise<{slug: string, post: {}}>}
 */
export const preparePostProps = async context => {
  const { slug } = context.query

  // Next.js will cache this result and turn the page into a static page. The payload will not be reloaded on the client.
  const post = await loadBlogPost(
    'http://0.0.0.0:3000/static/blog/' + slug + '.md'
  )

  return { slug, post }
}

/**
 * Loads the blog index and returns an array of posts
 * @returns {Promise<{posts: Array}>}
 */
export const prepareBlogProps = async maxPosts => {
  // Next.js will cache this result and turn the page into a static page. The payload will not be reloaded on the client.
  const posts = await loadBlogIndexFile(
    'http://0.0.0.0:3000/static/blog.json',
    maxPosts
  )

  return { posts }
}
