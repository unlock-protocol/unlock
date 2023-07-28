import { HTMLProps, createElement } from 'react'
import { useUnlockUI } from '../Provider'

export function Link({ href, ...rest }: HTMLProps<HTMLAnchorElement>) {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')
  const { Link } = useUnlockUI()
  const LinkComponent = Link || 'a'
  if (isInternalLink) {
    return createElement(LinkComponent, { href, ...rest })
  }

  if (isAnchorLink) {
    return createElement(LinkComponent, { href, ...rest })
  }

  return <a target="_blank" rel="noopener noreferrer" href={href} {...rest} />
}
