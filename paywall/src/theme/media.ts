import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import { MAX_DEVICE_WIDTHS, MIN_DEVICE_WIDTHS } from '../constants'

interface styledComponentCallback {
  (_template: TemplateStringsArray, ..._args: any[]): FlattenSimpleInterpolation
}

interface MediaType {
  [key: string]: styledComponentCallback
}

interface sizesType {
  [key: string]: {
    min: number
    max?: number
  }
}

const sizes: sizesType = {
  desktop: {
    min: MAX_DEVICE_WIDTHS.TABLET,
  },
  tablet: {
    min: MAX_DEVICE_WIDTHS.PHONE,
    max: MAX_DEVICE_WIDTHS.TABLET,
  },
  phone: {
    min: MIN_DEVICE_WIDTHS.PHONE,
    max: MAX_DEVICE_WIDTHS.PHONE,
  },
  nophone: {
    min: MAX_DEVICE_WIDTHS.PHONE,
  },
  nodesktop: {
    min: MIN_DEVICE_WIDTHS.PHONE,
    max: MAX_DEVICE_WIDTHS.TABLET,
  },
}

const Media: MediaType = Object.keys(sizes).reduce(
  (acc: MediaType, label: string) => {
    acc[label] = (
      template: TemplateStringsArray,
      ...args: any[]
    ): FlattenSimpleInterpolation => css`
      @media only screen and (min-width: ${sizes[label].min}px) ${sizes[label]
          .max
          ? `and (max-width: ${sizes[label].max}px)`
          : ''} {
        ${css(template, ...args)};
      }
    `
    return acc
  },
  {}
)

export const NoPhone = styled.div`
  ${Media.phone`
    display: none;
  `};
`

export const Phone = styled.div`
  ${Media.nophone`
    display: none;
  `};
`

export const Mobile = styled.div`
  ${Media.desktop`
    display: none;
  `};
`

export const Desktop = styled.div`
  ${Media.nodesktop`
    display: none;
  `};
`

export default Media
