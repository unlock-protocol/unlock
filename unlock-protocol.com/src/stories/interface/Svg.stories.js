import styled from 'styled-components'

import React from 'react'
import { storiesOf } from '@storybook/react'
import Svg from '../../components/interface/svg'

const wrapSvg = (name) => {
  return React.createElement(Svg[name], {})
}

storiesOf('SVG', module).add('Icons', () => {
  return (
    <div>
      <h1>All SVGs</h1>
      <Wrapper>
        {Object.keys(Svg).map((svgName) => {
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
  border: 1px solid var(--lightgrey);
  border-radius: 5px;

  &:hover {
    background-color: var(--offwhite);
    &:before {
      content: '${(props) => props.name}';
      position: absolute;
    }
  }

`
