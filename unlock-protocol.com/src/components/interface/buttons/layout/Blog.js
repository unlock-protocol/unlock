import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Blog = (props) => (
  <LayoutButton href="/blog" label="Blog" {...props}>
    <Svg.Blog title="Blog" />
  </LayoutButton>
)

export default Blog
