import React from 'react'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
} from '../../constants'

interface TwitterTagsProps {
  title?: string
  description?: string
  image?: string
}

export const TwitterTags = ({
  title = pageTitle(),
  description = PAGE_DESCRIPTION,
  image = PAGE_DEFAULT_IMAGE,
}: TwitterTagsProps) => {
  if (!title) title = pageTitle()
  if (!description) description = PAGE_DESCRIPTION
  if (!image) image = PAGE_DEFAULT_IMAGE

  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@UnlockProtocol" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  )
}

export default TwitterTags
