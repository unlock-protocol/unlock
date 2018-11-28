import React from 'react'
import { storiesOf } from '@storybook/react'
import Svg from '../../components/interface/svg'

const generateStory = name => {
  return React.createElement(Svg[name], {})
}

const stories = storiesOf('SVG', Svg)
Object.keys(Svg).forEach(svgName => {
  stories.add(svgName, () => {
    return generateStory(svgName)
  })
})
