/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import Svg from '../src/components'
import './stories.css'

const wrapSvg = name => {
  return React.createElement(Svg[name], {})
}

export const Icons = () => (
  <div className="wrapper">
    {Object.keys(Svg).map(svgName => {
      return (
        <div className="well" key={svgName} name={svgName}>
          {wrapSvg(svgName)}
        </div>
      )
    })}
  </div>
)

Icons.story = {
  name: 'with Icons',
}

export default {
  title: 'Button',
  component: Icons,
}
