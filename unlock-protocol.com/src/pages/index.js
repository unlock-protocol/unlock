import React from 'react'
import HomeContent from '../components/content/HomeContent'
import { prepareBlogProps } from '../utils/blogLoader'
import UnlockPropTypes from '../propTypes'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'

const Home = ({ posts }) => {
  return (
    <GlobalWrapper>
      <HomeContent posts={posts} />
    </GlobalWrapper>
  )
}

Home.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

Home.getInitialProps = async () => {
  return prepareBlogProps(3, 1)
}

export default Home
