import React from 'react'
import HomeContent from '../components/content/HomeContent'
import { prepareBlogProps } from '../utils/blogLoader'
import UnlockPropTypes from '../propTypes'

const Home = ({ posts }) => {
  return <HomeContent posts={posts} />
}

Home.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

Home.getInitialProps = async () => {
  return prepareBlogProps(3, 1)
}

export default Home
