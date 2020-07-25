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

Loading.defaultProps = {
  size: 60,
}

export const InlineLoading = ({ size }: Props) => {
  return (
    <InlineLoadingWrapper size={size}>
      <Svg.Loading title="loading" alt="loading" />
    </InlineLoadingWrapper>
  )
}

InlineLoading.defaultProps = {
  size: 60,
}

export default Loading

const LoadingWrapper = styled.section<Props>`
  display: grid;
  justify-items: center;
  svg {
    fill: var(--grey);
    width: ${(props: Props) => props.size}px;
  }
`

const InlineLoadingWrapper = styled.span<Props>`
  width: ${(props: Props) => props.size}px;
  margin-left: ${(props: Props) => props.size}px;
  svg {
    fill: var(--lightgrey);
    width: ${(props: Props) => props.size}px;
  }
`
