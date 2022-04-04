import { BLOG_PAGE_SIZE } from '../../config/constants'
import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import path from 'path'
import { PostsIndex } from '../../components/pages/Blog'
import { Post } from '../../components/pages/Blog/Post'
import {
  getPosts,
  BLOG_PATH,
  getPost,
  PostType,
  PostsIndexType,
  chunk,
} from '../../utils'
import { Layout } from '../../components/layout/DefaultLayout'
import { NextSeo } from 'next-seo'
import { routes } from '../../config/routes'
import { unlockConfig } from '../../config/unlock'
import { customizeSEO } from '../../config/seo'
interface PostsIndexProps extends PostsIndexType {
  type: 'postsIndex'
}

interface PostProps extends PostType {
  type: 'post'
}

type Props = PostProps | PostsIndexProps

const PostPage: NextPage<Props> = (props) => {
  if (props.type === 'postsIndex') {
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

  if (props.type === 'post') {
    const postSEO = customizeSEO({
      path: `/blog/${props.slug}`,
      imagePath: props.frontMatter.image,
      description: props.frontMatter.description,
      title: props.frontMatter.title,
    })
    return (
      <Layout>
        <NextSeo
          title={postSEO.title}
          description={postSEO.description}
          openGraph={postSEO.openGraph}
        />
        <Post {...props} />
      </Layout>
    )
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
    const nextIndexPage = currentIndexPage + 1
    return {
      props: {
        type: 'postsIndex',
        posts: postsIndex[currentIndexPage - 1],
        total: postsIndex.length,
        next: nextIndexPage > postsIndex.length ? null : nextIndexPage,
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
