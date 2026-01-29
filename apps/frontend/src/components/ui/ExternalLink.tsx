import type { AnchorHTMLAttributes } from 'react'

import { isExternalLink } from '@/utils/linkUtils'

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

const mergeRel = (rel: string | undefined, tokens: string[]) => {
  const current = rel?.split(' ').filter(Boolean) ?? []
  const merged = new Set([...current, ...tokens])
  return Array.from(merged).join(' ')
}

const ExternalLink = ({ href, rel, target, ...props }: ExternalLinkProps) => {
  const external = isExternalLink(href)
  const resolvedRel = external
    ? mergeRel(rel, ['noopener', 'noreferrer', 'nofollow'])
    : rel
  const resolvedTarget = external ? (target ?? '_blank') : target

  return <a href={href} rel={resolvedRel} target={resolvedTarget} {...props} />
}

export default ExternalLink
