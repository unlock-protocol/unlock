const MOCK_FILE_INFO = {
  '/foo/bar/static/blog/test1.md': `---
title: This is a sample post
subTitle: And some sample metadata
publishDate: Dec 31, 1978
---
Here is some markdown 
`,
  '/foo/bar/static/blog/test2.md': `---
title: This is a second sample post
subTitle: And some sample metadata
publishDate: Jan 7, 1979
---
Here is some markdown 
`,
  '/foo/bar/static/blog/test3.txt': `
Here is some non-markdown text content
`,
}

const blogJson =
  '{"items":[{"title":"This is a second sample post","subTitle":"And some sample metadata","publishDate":"Jan 7, 1979","slug":"test2"},{"title":"This is a sample post","subTitle":"And some sample metadata","publishDate":"Dec 31, 1978","slug":"test1"}]}'

let writtenData

describe('blog', () => {
  beforeEach(() => {
    jest.resetModules()
    writtenData = ''

    jest.mock('fs', () => ({
      readdirSync: jest.fn(() => {
        return ['test1.md', 'test2.md', 'test3.txt']
      }),
      readFileSync: jest.fn(filename => MOCK_FILE_INFO[filename]),
      writeFile: jest.fn((filename, data) => {
        writtenData = data
      }),
      statSync: jest.fn(() => {
        return {
          mtime: {
            getTime: jest.fn(() => 1),
          },
        }
      }),
    }))
  })
  it('should generate a blog feed array from a set of given markdown files', () => {
    expect.assertions(4)
    const blog = require('../../utils/blog')
    let feed = blog.generateBlogFeed('/foo/bar')

    expect(feed[0].slug).toEqual('test2')
    expect(feed[1].slug).toEqual('test1')
    expect(feed[0].__content).toEqual(undefined)
    expect(feed[1].__content).toEqual(undefined)
  })
  it('should generate a blog pages array from a blog feed', () => {
    expect.assertions(4)
    const blog = require('../../utils/blog')

    let feed = blog.generateBlogFeed('/foo/bar')
    let pages = blog.generateBlogPages(feed)

    expect(pages['/blog/test1'].page).toEqual('/post')
    expect(pages['/blog/test1'].query.slug).toEqual('test1')
    expect(pages['/blog/test2'].page).toEqual('/post')
    expect(pages['/blog/test2'].query.slug).toEqual('test2')
  })
  it('should generate a blog index file from a blog index array', () => {
    expect.assertions(1)

    const blog = require('../../utils/blog')

    let feed = blog.generateBlogFeed('/foo/bar')
    blog.generateBlogIndexFile('/foo/bar', feed)

    expect(writtenData).toEqual(blogJson)
  })
  it('should combine next-provided pages and blog index pages', () => {
    expect.assertions(2)
    const blog = require('../../utils/blog')

    const pages = {
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

    const combinedPages = blog.addBlogPagesToNext('/foo/bar', pages)

    expect(combinedPages['/log'].page).toEqual('/log')
    expect(combinedPages['/blog/test1'].page).toEqual('/post')
  })
})
