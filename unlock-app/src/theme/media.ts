import { css } from 'styled-components'
import { MAX_DEVICE_WIDTHS } from '../constants'

const sizes: { [key: string]: any } = {
  desktop: {
    min: MAX_DEVICE_WIDTHS.TABLET,
    max: MAX_DEVICE_WIDTHS.DESKTOP,
  },
  tablet: {
    min: MAX_DEVICE_WIDTHS.PHONE,
    max: MAX_DEVICE_WIDTHS.TABLET,
  },
  phone: {
    min: 0,
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

const Media: { [key: string]: any } = Object.keys(sizes).reduce(
  (acc: { [key: string]: any }, label) => {
    acc[label] = (arg: any, ...args: any[]) => css`
      @media only screen and (min-width: ${sizes[label].min}px) ${sizes[label]
          .max
          ? `and (max-width: ${sizes[label].max}px)`
          : ''} {
        ${css(arg, ...args)};
      }
    `
    return acc
  },
  {}
)

export default Media
