const MOCK_FILE_INFO = {
  '/foo/bar/blog/test1.md': `---
title: This is a sample post
subTitle: And some sample metadata
publishDate: Dec 31, 1978
---
Here is some markdown
`,
  '/foo/bar/blog/test2.md': `---
title: This is a second sample post
subTitle: And some sample metadata
publishDate: Jan 7, 1979
---
Here is some markdown
`,
  '/foo/bar/blog/test3.txt': `
Here is some non-markdown text content
`,
  '/foo/bar/blog/test3.md': `---
title: This is a post from the future
subTitle: And some sample metadata
publishDate: Jan 7, 2099
---
Here is some markdown
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

  it('should generate a post pages array from a blog feed', () => {
    expect.assertions(4)
    const blog = require('../../utils/blog')

    let feed = blog.generateBlogFeed('/foo/bar')
    let pages = blog.generatePostPages(feed)

    expect(pages['/blog/test1'].page).toEqual('/post')
    expect(pages['/blog/test1'].query.slug).toEqual('test1')
    expect(pages['/blog/test2'].page).toEqual('/post')
    expect(pages['/blog/test2'].query.slug).toEqual('test2')
  })

  it('should generate a blog pages array from a blog feed', () => {
    expect.assertions(8)
    const blog = require('../../utils/blog')

    let feed = ['post1', 'post2', 'post3', 'post4', 'post5', 'post6', 'post7']
    let pages = blog.generateBlogPages(feed.length, 2)

    expect(pages['/blog/1'].page).toEqual('/blog')
    expect(pages['/blog/1'].query.slug).toEqual('1')
    expect(pages['/blog/2'].page).toEqual('/blog')
    expect(pages['/blog/2'].query.slug).toEqual('2')
    expect(pages['/blog/3'].page).toEqual('/blog')
    expect(pages['/blog/3'].query.slug).toEqual('3')
    expect(pages['/blog/4'].page).toEqual('/blog')
    expect(pages['/blog/4'].query.slug).toEqual('4')
  })

  it('should generate a blog index file from a blog index array', () => {
    expect.assertions(1)

    const blog = require('../../utils/blog')

    let feed = blog.generateBlogFeed('/foo/bar')
    blog.generateBlogIndexFile('/foo/bar', feed)

    expect(writtenData).toEqual(blogJson)
  })

  it('should generate a blog RSS feed from a blog index array', () => {
    expect.assertions(6)

    const blog = require('../../utils/blog')

    let feed = blog.generateBlogFeed('/foo/bar')
    blog.generateRSSFile('/foo/bar', feed, 'https://unlock-protocol.com')

    const parser = new DOMParser()
    let xmlDoc = parser.parseFromString(writtenData, 'text/xml')

    let items = xmlDoc.getElementsByTagName('item')

    expect(xmlDoc.getElementsByTagName('channel').length).toEqual(1)
    expect(items.length).toEqual(2)
    expect(items[0].querySelector('title').textContent).toEqual(
      'This is a second sample post'
    )
    expect(items[1].querySelector('title').textContent).toEqual(
      'This is a sample post'
    )
    expect(items[0].querySelector('link').textContent).toEqual(
      'https://unlock-protocol.com/blog/test2'
    )
    expect(items[1].querySelector('link').textContent).toEqual(
      'https://unlock-protocol.com/blog/test1'
    )
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

    const combinedPages = blog.addBlogPagesToPageObject('/foo/bar', pages)

    expect(combinedPages['/log'].page).toEqual('/log')
    expect(combinedPages['/blog/test1'].page).toEqual('/post')
  })
})
