import React from 'react'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
} from '../../constants'

interface OpenGraphTagsProps {
  title?: string
  description?: string
  image?: string
  canonicalPath?: string
}

export const OpenGraphTags = ({
  title = pageTitle(),
  description = PAGE_DESCRIPTION,
  image = PAGE_DEFAULT_IMAGE,
  canonicalPath = '/',
}: OpenGraphTagsProps) => {
  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalPath} />
      <meta property="og:image" content={image} />
    </>
  )
}

export default OpenGraphTags
