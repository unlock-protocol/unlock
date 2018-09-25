import React from 'react'
import ColorScheme from 'color-scheme'

import UnlockPropTypes from '../../propTypes'

/**
 * This generates a lock icon unique for each lock
 * At this point, it only changes the colors of the 3 inner circles based on the lock address
 * @todo Customize position of circles
 * @body In order to get more unique lock icons we should also position (x, y and z) the inner circles
 * more uniquely based on the lock address... the challenge is to not have any white space.
 * @param {UnlockPropTypes.address} address
 */
export function Icon({ address }) {
  const mainColor = address.substring(2, 8).toUpperCase()
  const scheme = new ColorScheme()
  scheme.from_hex(mainColor)
    .scheme('triade')
    .variation('light')

  const colors = scheme.colors().map((c) => `#${c}`)

  return (
    <svg
      viewBox="0 0 216 216"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="100%"
      height="100%">
      <defs>
        <circle id="a" cx={108} cy={108} r={108} />
        <circle id="c" cx={108} cy={108} r={60.75} />
      </defs>
      <g>
        <mask id="b" fill="#fff">
          <use xlinkHref="#a" />
        </mask>
        <circle fill={colors[0]} mask="url(#b)" cx={195.75} cy={114.75} r={114.75} />
        <circle fill={colors[1]} mask="url(#b)" cx={33.75} cy={162} r={114.75} />
        <circle fill={colors[2]} mask="url(#b)" cx={121.5} r={114.75} />
        <mask id="d" fill="#fff">
          <use xlinkHref="#c" />
        </mask>
        <use fill="#FFF" xlinkHref="#c" />
        <path
          d="M121.179 116.422c-.001.895-.05 1.797-.168 2.683-1.047 7.845-9.512 12.951-17.006 10.275-5.482-1.958-8.917-6.786-8.921-12.582-.003-3.972-.003-7.944-.003-11.916h26.103c-.001 3.847-.002 7.694-.005 11.54m16.198-34.477V81h-16.335v16.198H94.936l.001-15.26v-.918h-16.28c-.014.196-.035.34-.035.483.001 5.232-.012 10.463-.019 15.695H74.25v7.694h4.353c.004 4.167.015 8.334.05 12.5.07 8.231 3.508 15.052 9.88 20.2 9.188 7.422 19.562 9 30.636 4.94 10.486-3.846 18.35-13.87 18.231-26.081-.037-3.853-.05-7.706-.054-11.559h4.404v-7.694h-4.4c.01-5.085.027-10.17.027-15.253"
          fill={colors[0]}
          mask="url(#d)"
        />
      </g>
    </svg>
  )
}

Icon.propTypes = {
  address: UnlockPropTypes.address,
}

export default Icon
