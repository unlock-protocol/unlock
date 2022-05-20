import { getPosts, BLOG_PATH, PostsIndexType } from '../../utils/posts'
import { chunk } from '../../utils/chunk'
import { BLOG_PAGE_SIZE } from '../../config/constants'
import type { NextPage, GetStaticProps } from 'next'
import { PostsIndex } from '../../components/pages/Blog'
import { generateFeed } from '../../utils/feed'
import { routes } from '../../config/routes'
import { NextSeo } from 'next-seo'
import { Layout } from '../../components/layout/DefaultLayout'

export type Props = PostsIndexType

const BlogIndexPage: NextPage<PostsIndexType> = (props) => {
  return (
    <Layout>
      <NextSeo
        title={routes.blog.seo.title}
        description={routes.blog.seo.description}
        openGraph={routes.blog.seo.openGraph}
      />

      <PostsIndex {...props} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts(BLOG_PATH)
  await generateFeed(posts)
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
