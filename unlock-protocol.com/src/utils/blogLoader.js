const yamlFront = require('yaml-front-matter')

/**
 * Given the URL of a blog index file, returns an array of posts
 * @param maxPosts
 * @returns {Promise<Array>}
 */
export const loadBlogIndexFile = async (maxPosts = 10, pageNumber = 1) => {
  let index
  try {
    const response = await require('../../blog/blog.index')
    index = await JSON.parse(response.default)
  } catch (e) {
    index = {} // Just set up a default object
  }

  let posts = []
  let totalPages = 0
  let totalPosts = 0
  if (index.items) {
    totalPages = Math.ceil(index.items.length / maxPosts)
    totalPosts = index.items.length
    index.items.forEach(item => {
      if (Date.parse(item.publishDate) <= Date.now()) {
        posts.push(item)
      }
    })
    posts = posts.slice((pageNumber - 1) * maxPosts, pageNumber * maxPosts)
  }

  return {
    posts,
    totalPages,
    totalPosts,
  }
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
 * @param slug
 * @returns {Promise<{slug: string, post: {}}>}
 */
export const preparePostProps = async slug => {
  const post = await loadBlogPost(slug)

  return { slug, post }
}

/**
 * Loads the blog index and returns an array of posts
 * @param maxPosts
 * @param pageNumber
 * @returns {Promise<{posts: Array}>}
 */
export const prepareBlogProps = async (maxPosts, pageNumber) => {
  const byPage = maxPosts || 10
  const page = pageNumber || 1
  const { posts, totalPages, totalPosts } = await loadBlogIndexFile(
    byPage,
    page
  )

  return { posts, totalPages, totalPosts, byPage, page }
}
