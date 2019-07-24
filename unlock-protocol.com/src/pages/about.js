import React from 'react'
import AboutContent from '../components/content/AboutContent'
import { prepareBlogProps } from '../utils/blogLoader'
import UnlockPropTypes from '../propTypes'

const About = ({ posts }) => <AboutContent posts={posts} />

About.propTypes = {
  posts: UnlockPropTypes.postFeed.isRequired,
}

About.getInitialProps = async () => {
  // Showing 10 posts on the blog page
  return await prepareBlogProps(10, 1)
}

export default About
