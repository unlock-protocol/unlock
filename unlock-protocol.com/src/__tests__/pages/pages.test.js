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

jest.mock('../../constants')

describe('Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('About', () => {
    it('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(<About />)
      expect(pageTitle).toBeCalledWith('About')
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
      rtl.render(<Blog posts={[]} />)

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

      const page = rtl.render(<Blog posts={posts} />)

      expect(page.queryByText(posts[0].title)).not.toBeNull()
      expect(page.queryByText(posts[0].authorName)).not.toBeNull()
      expect(page.queryByText(posts[0].description)).not.toBeNull()
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
  })
})
