import React from 'react'
import styled from 'styled-components'
import Svg from './svg'

const Loading = () => {
  return (
    <LoadingWrapper>
      <Svg.Loading title="loading" alt="loading" />
    </LoadingWrapper>
  )
}

export default Loading

const LoadingWrapper = styled.section`
  display: grid;
  justify-items: center;
  svg {
    fill: var(--lightgrey);
    width: 60px;
  }
`
