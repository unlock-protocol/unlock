import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const About = (props) => (
  <LayoutButton href="/about" label="About" {...props}>
    <Svg.About title="About" />
  </LayoutButton>
)

export default About
