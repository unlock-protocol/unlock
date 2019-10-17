import React from 'react'
import styled from 'styled-components'
import Svg from './svg'

interface Props {
  size?: number
}

const Loading = ({ size }: Props) => {
  return (
    <LoadingWrapper size={size}>
      <Svg.Loading title="loading" alt="loading" />
    </LoadingWrapper>
  )
}

export const InlineLoading = ({ size }: Props) => {
  return (
    <InlineLoadingWrapper size={size}>
      <Svg.Loading title="loading" alt="loading" />
    </InlineLoadingWrapper>
  )
}

export default Loading

const LoadingWrapper = styled.section<Props>`
  display: grid;
  justify-items: center;
  svg {
    fill: var(--lightgrey);
    width: ${(props: Props) => props.size || 60}px;
  }
`

const InlineLoadingWrapper = styled.span<Props>`
  width: ${(props: Props) => props.size || 60}px;
  margin-left: ${(props: Props) => props.size || 60}px;
  svg {
    fill: var(--lightgrey);
    width: ${(props: Props) => props.size || 60}px;
  }
`
