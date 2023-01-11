import React from 'react'
import * as rtl from '@testing-library/react'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
} from '../../../constants'
import TwitterTags from '../../../components/page/TwitterTags'

describe('TwitterTags', () => {
  it('should render twitter tags based on default values', () => {
    expect.assertions(3)
    const tags = rtl.render(
      TwitterTags({
        title: null,
        description: null,
        image: null,
      })
    )
    expect(
      tags.container.querySelector("meta[name='twitter:title']").content
    ).toBe(pageTitle())
    expect(
      tags.container.querySelector("meta[name='twitter:description']").content
    ).toBe(PAGE_DESCRIPTION)
    expect(
      tags.container.querySelector("meta[name='twitter:image']").content
    ).toBe(PAGE_DEFAULT_IMAGE)
  })

  it('should render twitter tags based on custom values', () => {
    expect.assertions(3)
    const title = 'custom title'
    const description = 'I am the very model of a model view controller'
    const image = '/some/image.png'
    const tags = rtl.render(
      TwitterTags({
        title,
        description,
        image,
      })
    )
    expect(
      tags.container.querySelector("meta[name='twitter:title']").content
    ).toBe(title)
    expect(
      tags.container.querySelector("meta[name='twitter:description']").content
    ).toBe(description)
    expect(
      tags.container.querySelector("meta[name='twitter:image']").content
    ).toBe(image)
  })
})
