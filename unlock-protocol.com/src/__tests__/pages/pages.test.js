import React from 'react'
import * as rtl from 'react-testing-library'

import Home from '../../pages/home'
import Jobs from '../../pages/jobs'
import About from '../../pages/about'
import Privacy from '../../pages/privacy'
import Terms from '../../pages/terms'

import { pageTitle } from '../../constants'
import Blog from '../../pages/blog'
import Post from '../../pages/post'

import { prepareBlogProps, preparePostProps } from '../../utils/blogLoader'

jest.mock('../../constants')
jest.mock('../../utils/blogLoader')

describe('Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('About', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<About posts={[]} />)
      expect(pageTitle).toBeCalledWith('About')
    })

    it('should render posts correctly', () => {
      expect.assertions(3)
      const posts = [
        {
          title: 'Sample post',
          description: 'Description',
          authorName: 'Author name',
          publishDate: 'Publish date',
          image: '/foo/image.jpg',
          slug: 'sample-post',
        },
      ]

      const page = rtl.render(<About posts={posts} />)
      expect(pageTitle).toBeCalledWith('About')
      expect(page.queryByText('Description')).not.toBeNull()
      expect(page.queryByText('Publish date')).not.toBeNull()
    })

    it('should load blog posts as initial props', async () => {
      expect.assertions(1)

      await About.getInitialProps()
      expect(prepareBlogProps).toHaveBeenCalledTimes(1)
    })
  })

  describe('Home', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Home />)
      expect(pageTitle).toBeCalled()
    })
  })

  describe('Jobs', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Jobs />)
      expect(pageTitle).toBeCalledWith('Work at Unlock')
    })
  })

  describe('Privacy', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Privacy />)
      expect(pageTitle).toBeCalledWith('Privacy Policy')
    })
  })

  describe('Terms', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Terms />)
      expect(pageTitle).toBeCalledWith('Terms of Service')
    })
  })

  describe('Blog', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<Blog page={1} totalPages={1} posts={[]} />)

      expect(pageTitle).toBeCalledWith('Blog')
    })

    it('should render post preview correctly', () => {
      expect.assertions(3)

      const posts = [
        {
          slug: 'test1',
          title: 'Test post',
          publishDate: 'November 23, 1963',
          authorName: 'Susan Foreman',
          description: 'One day, I will come back.',
        },
      ]

      const page = rtl.render(<Blog page={1} totalPages={1} posts={posts} />)

      expect(page.queryByText(posts[0].title)).not.toBeNull()
      expect(page.queryByText(posts[0].authorName)).not.toBeNull()
      expect(page.queryByText(posts[0].description)).not.toBeNull()
    })

    it('should load blog posts as initial props', async () => {
      expect.assertions(2)

      await Blog.getInitialProps({
        query: {
          slug: '2',
        },
      })
      expect(prepareBlogProps).toHaveBeenCalledTimes(1)
      expect(prepareBlogProps).toHaveBeenCalledWith(10, 2)
    })
  })

  describe('Post', () => {
    it('should render title correctly', () => {
      expect.assertions(2)
      const post = {
        title: 'Test post',
        slug: 'test1',
        description: 'Test description',
        publishDate: 'November 23, 1963',
        __content: 'Now is the limiter of this content',
      }
      const slug = 'test1'
      const page = rtl.render(<Post post={post} slug={slug} />)

      expect(pageTitle).toBeCalledWith(post.title)
      expect(page.queryByText(post.__content)).not.toBeNull()
    })

    it('should load post details in initial props', async () => {
      expect.assertions(2)

      await Post.getInitialProps({
        query: {
          slug: 'a-post',
        },
      })
      expect(preparePostProps).toHaveBeenCalledTimes(1)
      expect(preparePostProps).toHaveBeenCalledWith('a-post')
    })
  })
})
