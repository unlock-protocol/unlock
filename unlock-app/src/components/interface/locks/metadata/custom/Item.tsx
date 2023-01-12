import React from 'react'

import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'

export const LearnMoreAboutOpenseaMetadataLink = () => {
  return (
    <a
      href="https://docs.opensea.io/docs/metadata-standards"
      target="_blank"
      rel="noopener noreferrer"
      className="px-2 py-0.5 rounded-lg inline-flex items-center gap-2 text-sm hover:bg-gray-100 bg-gray-50 text-gray-500 hover:text-black"
    >
      <span>Learn more</span>
      <ExternalLinkIcon />
    </a>
  )
}
