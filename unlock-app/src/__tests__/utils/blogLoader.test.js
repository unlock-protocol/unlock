import {
  loadBlogIndexFile,
  loadBlogPost,
  preparePostProps,
  prepareBlogProps,
} from '../../utils/blogLoader'

const blogJson =
  '{"items":[{"title":"This is a second sample post","subTitle":"And some sample metadata","publishDate":"Jan 7, 1979","slug":"test2"},{"title":"This is a sample post","subTitle":"And some sample metadata","publishDate":"Dec 31, 1978","slug":"test1"},{"title":"This is a FUTURE POST","subTitle":"IT IS FROM THE FUTURE","publishDate":"Jan 7, 2037","slug":"future"}]}'

const blogPost = `---
title: This is a sample post
subTitle: And some sample metadata
publishDate: Dec 31, 1978
---
Here is some markdown 
`

describe('blogLoader', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('loads blog index file into a post array', async () => {
    expect.assertions(2)

    fetch.mockResponseOnce(blogJson)
    let posts = await loadBlogIndexFile('https://foo/bar', 10)
    expect(posts[0].slug).toEqual('test2')
    expect(posts[1].slug).toEqual('test1')
  })

  it('loads blog index file into a post array and limits size', async () => {
    expect.assertions(2)

    fetch.mockResponseOnce(blogJson)
    let posts = await loadBlogIndexFile('https://foo/bar', 1)
    expect(posts[0].slug).toEqual('test2')
    expect(posts[1]).toBe(undefined)
  })

  it('returns 0 pages if given an index file with no items', async () => {
    expect.assertions(1)

    fetch.mockResponseOnce(JSON.stringify({ foo: 'bar' }))
    let posts = await loadBlogIndexFile('https://foo/bar', 10)
    expect(posts.length).toEqual(0)
  })

  it('loads a blog post into an object', async () => {
    expect.assertions(2)

    fetch.mockResponseOnce(blogPost)
    let post = await loadBlogPost('https://foo/bar')
    expect(post.title).toEqual('This is a sample post')
    expect(post.__content).toContain('Here is some markdown')
  })

  it('given a context object, returns a blog post and slug for the post page', async () => {
    expect.assertions(2)

    fetch.mockResponseOnce(blogPost)
    let { slug, post } = await preparePostProps({ query: { slug: 'test1' } })
    expect(slug).toEqual('test1')
    expect(post.title).toEqual('This is a sample post')
  })

  it('loads the blog index and prepares an array of posts for the blog index page', async () => {
    expect.assertions(2)

    fetch.mockResponseOnce(blogJson)
    let { posts } = await prepareBlogProps(10)
    expect(posts[0].slug).toEqual('test2')
    expect(posts[1].slug).toEqual('test1')
  })

  it('loads an empty blog index if non-JSON content is returned from the endpoint', async () => {
    expect.assertions(1)

    fetch.mockResponseOnce(
      '<arbitrary-tag>Hello, I am not JSON</arbitrary-tag>'
    )
    let posts = await loadBlogIndexFile('https://foo/bar', 10)
    expect(posts.length).toEqual(0)
  })

  it('ignores future posts', async () => {
    expect.assertions(3)

    fetch.mockResponseOnce(blogJson)
    let posts = await loadBlogIndexFile('https://foo/bar', 10)
    expect(posts.length).toEqual(2) // Ignores the future post
    expect(posts[0].slug).toEqual('test2')
    expect(posts[1].slug).toEqual('test1')
  })
})
