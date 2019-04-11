import styled, { css } from 'styled-components'
import { MAX_DEVICE_WIDTHS } from '../constants'

let sizes = {
  desktop: {
    min: MAX_DEVICE_WIDTHS.TABLET,
    max: MAX_DEVICE_WIDTHS.DESKTOP,
  },
  tablet: {
    min: MAX_DEVICE_WIDTHS.PHONE,
    max: MAX_DEVICE_WIDTHS.TABLET,
  },
  phone: {
    // this needs to be 257 because the paywall width in the iframe is 134px
    // on desktop, so we need to make sure that we don't match that
    // window width
    min: 257,
    max: MAX_DEVICE_WIDTHS.PHONE,
  },
}

sizes.nophone = {
  min: sizes.phone.max,
  max: false,
}
sizes.nodesktop = {
  max: sizes.desktop.min,
  min: sizes.phone.min,
}

const Media = Object.keys(sizes).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media only screen and (min-width: ${sizes[label].min}px) ${sizes[label].max
        ? `and (max-width: ${sizes[label].max}px)`
        : ''} {
      ${css(...args)};
    }
  `
  return acc
}, {})

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
