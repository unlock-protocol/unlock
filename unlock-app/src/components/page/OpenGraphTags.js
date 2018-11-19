import React from 'react'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
  CANONICAL_BASE_URL,
} from '../../constants'

export const OpenGraphTags = ({ title, description, image, canonicalPath }) => {
  if (!title) title = pageTitle()
  if (!description) description = PAGE_DESCRIPTION
  if (!image) image = PAGE_DEFAULT_IMAGE
  if (!canonicalPath) canonicalPath = '/'

  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={CANONICAL_BASE_URL + canonicalPath} />
      <meta property="og:image" content={image} />
    </>
  )
}

export default OpenGraphTags
