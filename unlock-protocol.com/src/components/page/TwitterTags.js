import PropTypes from 'prop-types'
import React from 'react'
import getConfig from 'next/config'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
} from '../../constants'

const config = getConfig().publicRuntimeConfig

export const TwitterTags = ({ title, description, image }) => {
  if (!title) title = pageTitle()
  if (!description) description = PAGE_DESCRIPTION
  if (!image) image = PAGE_DEFAULT_IMAGE
  const absolutePathImage = `${config.urlBase || ''}${image}`

  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@UnlockProtocol" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absolutePathImage} />
    </>
  )
}

TwitterTags.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
}

TwitterTags.defaultProps = {
  title: pageTitle(),
  description: PAGE_DESCRIPTION,
  image: PAGE_DEFAULT_IMAGE,
}

export default TwitterTags
