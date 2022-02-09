import { getPosts, BLOG_PATH, PostsIndexType } from '../../utils/posts'
import { chunk } from '../../utils/chunk'
import { BLOG_PAGE_SIZE } from '../../config/constants'
import type { NextPage, GetStaticProps } from 'next'
import { PostsIndex } from '../../components/pages/Blog'

interface Props extends PostsIndexType {}

const BlogIndexPage: NextPage<Props> = (props) => {
  return <PostsIndex {...props} />
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts(BLOG_PATH)
  const postsIndex = chunk(posts, BLOG_PAGE_SIZE)
  const currentIndex = 0
  return {
    props: {
      posts: postsIndex[currentIndex],
      total: postsIndex.length,
      next: currentIndex + 2,
      prev: null,
    },
  }
}

export default BlogIndexPage
