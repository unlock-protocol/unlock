import Svg from '../../svg'
import React from 'react'
import { LayoutButton } from '../Button'

const About = () => (
  <LayoutButton to="/about" title="About">
    <Svg.About />
  </LayoutButton>
)

export default About
