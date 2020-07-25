import ColorScheme = require('color-scheme')

export const lockIcon = (address: string) => {
  /**
   * This computes how much rotation to apply to the lock glyph
   * @param {string} address
   * @returns {number}
   */
  const degreesOfRotation = (address: string) => {
    const n = parseInt(address)
    return (n % 36) * 10
  }

  /**
   * Translates and scales the lock glyph
   * @param address
   */
  const translateAndScale = (address: string) => {
    const n = parseInt(address)
    return n % 2 == 0 ? '' : 'tranlate(216, 0) scale(-1, 1)'
  }

  // Default colors
  const scheme = new ColorScheme()
  const mainColor = address.substring(2, 8).toUpperCase()
  scheme.from_hex(mainColor).scheme('triade').variation('pastel')
  const colors = scheme.colors().map((c: string) => `#${c}`)

  // Default origin icon
  const originalIcon = [
    { x: 195.75, y: 114.75 },
    { x: 33.75, y: 162 },
    { x: 121.5, y: 0 },
  ]

  // Stripped variant
  const stripedIcon = [
    { x: 108, y: 108 },
    { x: 146, y: 147 },
    { x: 216, y: 216 },
  ]

  // Chomp variant
  const chompIcon = [
    { x: 108, y: 108 },
    { x: 108, y: -64 },
    { x: 108, y: 280 },
  ]

  // Bite variant
  const biteIcon = [
    { x: 108, y: 108 },
    { x: 108, y: 0 },
    { x: 108, y: 216 },
  ]

  // Tail variant
  const tailIcon = [
    { x: 108, y: 108 },
    { x: 64, y: 0 },
    { x: 64, y: 216 },
  ]

  // Traid variant
  const triadIcon = [
    { x: 108, y: 108 },
    { x: 32, y: 0 },
    { x: 32, y: 216 },
  ]

  /**
   * This selects a set of 3 circles (specified by position) to use to construct the lock icon.
   * @param {string} address
   * @returns {object}
   */
  const circles = (address: string) => {
    const options = [
      originalIcon,
      stripedIcon,
      chompIcon,
      biteIcon,
      tailIcon,
      triadIcon,
    ]
    const n = parseInt(address) % options.length
    return options[n]
  }

  const innerCircles = circles(address)

  const svg = `<svg
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 216 216"
      width="100%"
    >
      <defs>
        <circle id="a" cx="108" cy="108" r="108" />
        <circle id="c" cx="108" cy="108" r="60.75" />
      </defs>
      <g>
        <mask id="b" fill="#fff">
          <use xlink:href="#a" />
        </mask>
        <g
          transform="rotate(${degreesOfRotation(
            address
          )}, 108, 108) ${translateAndScale(address)}">
          <circle
            fill="${colors[0]}"
            mask="url(#b)"
            cx="${innerCircles[0].x}"
            cy="${innerCircles[0].y}"
            r="114.75"
          />
          <circle
            fill="${colors[1]}"
            mask="url(#b)"
            cx="${innerCircles[1].x}"
            cy="${innerCircles[1].y}"
            r="114.75"
          />
          <circle
            fill="${colors[2]}"
            mask="url(#b)"
            cx="${innerCircles[2].x}"
            cy="${innerCircles[2].y}"
            r="114.75"
          />
        </g>
        <mask id="d" fill="#fff">
          <use xlink:href="#c" />
        </mask>
        <use fill="#FFF" xlink:href="#c" />
        <path
          d="M121.179 116.422c-.001.895-.05 1.797-.168 2.683-1.047 7.845-9.512 12.951-17.006 10.275-5.482-1.958-8.917-6.786-8.921-12.582-.003-3.972-.003-7.944-.003-11.916h26.103c-.001 3.847-.002 7.694-.005 11.54m16.198-34.477V81h-16.335v16.198H94.936l.001-15.26v-.918h-16.28c-.014.196-.035.34-.035.483.001 5.232-.012 10.463-.019 15.695H74.25v7.694h4.353c.004 4.167.015 8.334.05 12.5.07 8.231 3.508 15.052 9.88 20.2 9.188 7.422 19.562 9 30.636 4.94 10.486-3.846 18.35-13.87 18.231-26.081-.037-3.853-.05-7.706-.054-11.559h4.404v-7.694h-4.4c.01-5.085.027-10.17.027-15.253"
          fill="${colors[0]}"
          mask="url(#d)"
        />
      </g>
    </svg>`
  return svg
}

export default {
  lockIcon,
}
