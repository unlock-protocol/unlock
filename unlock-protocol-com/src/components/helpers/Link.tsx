import NextLink from 'next/link'
import { HTMLProps } from 'react'

// Wrap the anchor tag inside NextLink if it's an internal link otherwise return a normal anchor tag
export function Link({ href, ...rest }: HTMLProps<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    return (
      <NextLink href={href}>
        <a {...rest} />
      </NextLink>
    )
  }

  if (isAnchorLink) {
    return <a href={href} {...rest} />
  }

  return <a target="_blank" rel="noopener noreferrer" href={href} {...rest} />
}
