import React from 'react'
import AboutContent from '../components/content/AboutContent'
import { prepareBlogProps } from '../utils/blogLoader'
import UnlockPropTypes from '../propTypes'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'

const About = ({ posts }) => (
  <GlobalWrapper>
    <AboutContent posts={posts} />
  </GlobalWrapper>
)

About.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

About.getInitialProps = async () => {
  // Showing 10 posts on the blog page
  return prepareBlogProps(10, 1)
}

export default About
