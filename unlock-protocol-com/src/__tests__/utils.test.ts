import { describe, it, expect } from 'vitest'
import { chunk } from '../utils/chunk'
import { getPosts, BLOG_PATH } from '../utils/posts'

describe('Test utilts', () => {
  describe('Test chunk', () => {
    it('Should create proper chunks of an array', () => {
      expect.assertions(3)
      const array = [2, 4, 6, 2, 6, 3, 6]
      const chunks = chunk(array, 2)
      expect(chunks.length).toBe(4)
      expect(chunks[0]).toEqual([2, 4])
      const chunks2 = chunk([], 0)
      expect(chunks2).toEqual([])
    })
  })

  describe('Test posts utils', () => {
    it('Should read all the blog posts', async () => {
      expect.assertions(3)
      const posts = await getPosts(BLOG_PATH)
      const post = posts[0]
      expect(posts.length).toBeGreaterThan(1)
      expect(post.filePath).toBeTruthy()
      expect(post.slug).not.toBe(post.filePath)
    })
  })
})
