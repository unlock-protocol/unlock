import styled, { css } from 'styled-components'

let sizes = {
  desktop: {
    min: 1200,
    max: false,
  },
  tablet: {
    min: 737,
    max: 1200,
  },
  phone: {
    min: 300,
    max: 736,
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
    @media only screen and (min-device-width: ${sizes[label].min}px) ${sizes[
  label
].max
  ? `and (max-device-width: ${sizes[label].max}px)`
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
