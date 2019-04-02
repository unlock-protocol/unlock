const yamlFront = require('yaml-front-matter')

/**
 * Given the URL of a blog index file, returns an array of posts
 * @param maxPosts
 * @returns {Promise<Array>}
 */
export const loadBlogIndexFile = async maxPosts => {
  let index
  try {
    const response = await require('../../blog/blog.index')
    index = await JSON.parse(response.default)
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
 * Loads a parsed blog post object from a markdown file location (or an empty object if no blog post was found)
 * @param slug
 * @returns {Promise<{}>}
 */
export const loadBlogPost = async slug => {
  try {
    const fileContents = await require('../../blog/' + slug + '.md') // eslint-disable-line import/no-dynamic-require
    return yamlFront.loadFront(fileContents.default)
  } catch (e) {
    return {}
  }
}

/**
 * Given a page context, returns a slug and post object
 * @param context
 * @returns {Promise<{slug: string, post: {}}>}
 */
export const preparePostProps = async context => {
  const { slug } = context.query

  const post = await loadBlogPost(slug)

  return { slug, post }
}

/**
 * Loads the blog index and returns an array of posts
 * @returns {Promise<{posts: Array}>}
 */
export const prepareBlogProps = async maxPosts => {
  const posts = await loadBlogIndexFile(maxPosts)

  return { posts }
}
