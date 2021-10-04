/* eslint-disable no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react'
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import assets from '../index'

const { SvgComponents } = assets

const wrapSvg = (name) => {
  return React.createElement(SvgComponents[name], { title: name })
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 200px);
  grid-gap: 16px;
  align-items: center;
  justify-itens: center;

  svg {
    max-width: 200px;
  }
`

const Well = styled.div`
  width: 200px;
  height: 200px;
  border: 1px solid lightgray;
  border-radius: 5px;

  &:hover {
    background-color: lightgrey);
    &:before {
      content: '${(props) => props.name}';
      position: absolute;
    }
  }
`
storiesOf('SVG', module).add('SVG', () => {
  return (
    <div>
      <h1>All SVGs</h1>
      <Wrapper>
        {Object.keys(SvgComponents).map((svgName) => {
          return (
            <Well key={svgName} name={svgName}>
              {wrapSvg(svgName)}
            </Well>
          )
        })}
      </Wrapper>
    </div>
  )
})
