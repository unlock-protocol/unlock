import PropTypes from 'prop-types'
import React from 'react'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
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
      <meta property="og:url" content={canonicalPath} />
      <meta property="og:image" content={image} />
    </>
  )
}

OpenGraphTags.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  canonicalPath: PropTypes.string,
}

OpenGraphTags.defaultProps = {
  title: pageTitle(),
  description: PAGE_DESCRIPTION,
  image: PAGE_DEFAULT_IMAGE,
  canonicalPath: '/',
}

export default OpenGraphTags
