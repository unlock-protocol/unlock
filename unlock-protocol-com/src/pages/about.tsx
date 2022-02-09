import type { GetStaticProps, NextPage } from 'next'
import { About } from '../components/pages/About'
import { BLOG_PAGE_SIZE } from '../config/constants'
import { BLOG_PATH, getPosts, PostType } from '../utils'

interface Props {
  updates: PostType[]
}

const AboutPage: NextPage<Props> = ({ updates }: Props) => {
  return <About updates={updates} />
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getPosts(BLOG_PATH)
  return {
    props: {
      updates: posts.slice(0, BLOG_PAGE_SIZE),
    },
  }
}

export default AboutPage
