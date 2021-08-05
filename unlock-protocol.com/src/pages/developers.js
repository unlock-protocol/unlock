import React from 'react'
import DevelopersContent from '../components/content/DevelopersContent'
import { prepareBlogProps } from '../utils/blogLoader'
import UnlockPropTypes from '../propTypes'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'

const Developers = ({ posts }) => (
  <GlobalWrapper>
    <DevelopersContent posts={posts} />
  </GlobalWrapper>
)

Developers.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

Developers.getInitialProps = async () => {
  // Showing 10 posts on the blog page
  return prepareBlogProps(10, 1)
}

export default Developers
