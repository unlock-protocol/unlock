import {
  getPosts,
  BLOG_PATH,
  getPost,
  PostType,
  PostsIndexType,
} from '../../utils/posts'
import { chunk } from '../../utils/chunk'
import { BLOG_PAGE_SIZE } from '../../config/constants'
import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import path from 'path'
import { PostsIndex } from '../../components/pages/Blog'
import { Post } from '../../components/pages/Blog/Post'

interface PostsIndexProps extends PostsIndexType {
  type: 'postsIndex'
}

interface PostProps extends PostType {
  type: 'post'
}

type Props = PostProps | PostsIndexProps

const PostPage: NextPage<Props> = (props) => {
  if (props.type === 'postsIndex') {
    return <PostsIndex {...props} />
  }

  if (props.type === 'post') {
    return <Post {...props} />
  }
  return <div> Nothing found! </div>
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts(BLOG_PATH)
  const postsIndex = chunk(posts, BLOG_PAGE_SIZE)

  const slugs = [
    new Array(postsIndex.length).fill(0).map((_, index) => String(index + 1)),
    posts.map((post) => post.slug),
  ].flat()

  const paths = slugs.map((slug) => path.join('/blog', slug))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug

  // For legacy compaitibility, we need to use the same slug param to also render the relevant posts index page.
  const postsIndexPage = Number(slug)
  if (postsIndexPage) {
    const posts = await getPosts(BLOG_PATH)
    const postsIndex = chunk(posts, BLOG_PAGE_SIZE)
    const currentIndexPage = postsIndexPage
    return {
      props: {
        type: 'postsIndex',
        posts: postsIndex[currentIndexPage - 1],
        total: postsIndex.length,
        next: currentIndexPage + 1,
        prev: currentIndexPage ? currentIndexPage - 1 : null,
      },
    }
  } else {
    const post = await getPost(`${slug}.md`, BLOG_PATH)
    return {
      props: {
        type: 'post',
        ...post,
      },
    }
  }
}

export default PostPage
