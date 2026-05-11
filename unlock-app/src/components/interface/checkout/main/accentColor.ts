const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const getCheckoutAccentColor = (accentColor?: string) => {
  const color = accentColor?.trim()

  if (!color || !HEX_COLOR.test(color)) {
    return undefined
  }

  return color
}
