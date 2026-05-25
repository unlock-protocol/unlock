import type { CSSProperties } from 'react'
import type { PaywallConfigType } from '@unlock-protocol/core'

type CheckoutThemeConfig = PaywallConfigType & {
  accentColor?: unknown
  accentColour?: unknown
}

const HEX_COLOR_PATTERN =
  /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export const getCheckoutAccentColor = (
  paywallConfig?: PaywallConfigType
): string | undefined => {
  const { accentColor, accentColour } =
    (paywallConfig as CheckoutThemeConfig | undefined) ?? {}
  const color = typeof accentColor === 'string' ? accentColor : accentColour

  if (typeof color !== 'string') {
    return undefined
  }

  const trimmedColor = color.trim()

  return HEX_COLOR_PATTERN.test(trimmedColor) ? trimmedColor : undefined
}

export const getCheckoutAccentStyle = (
  accentColor?: string
): CSSProperties | undefined => {
  if (!accentColor) {
    return undefined
  }

  return {
    '--unlock-checkout-accent': accentColor,
  } as CSSProperties
}
