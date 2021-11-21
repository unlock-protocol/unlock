import React from 'react'
import * as rtl from '@testing-library/react'
import { pageTitle, PAGE_DESCRIPTION } from '../../../constants'
import OpenGraphTags from '../../../components/page/OpenGraphTags'

describe('OpenGraphTags', () => {
  it('should render open graph tags based on default values', () => {
    expect.assertions(5)
    const tags = rtl.render(<OpenGraphTags />)
    expect(
      tags.container.querySelector("meta[property='og:title']").content
    ).toBe(pageTitle())
    expect(
      tags.container.querySelector("meta[property='og:description']").content
    ).toBe(PAGE_DESCRIPTION)
    expect(
      tags.container.querySelector("meta[property='og:image']").content
    ).toBe('https://unlock-protocol.com/images/pages/png/simple.png')
    expect(
      tags.container.querySelector("meta[property='og:type']").content
    ).toBe('website')
    expect(
      tags.container.querySelector("meta[property='og:url']").content
    ).toBe('https://unlock-protocol.com/')
  })

  it('should render open graph tags based on custom values', () => {
    expect.assertions(5)
    const title = 'custom title'
    const description = 'I am the very model of a model view controller'
    const image = '/some/image.png'
    const path = '/lemon'
    const tags = rtl.render(
      <OpenGraphTags
        title={title}
        description={description}
        image={image}
        canonicalPath={path}
      />
    )
    expect(
      tags.container.querySelector("meta[property='og:title']").content
    ).toBe(title)
    expect(
      tags.container.querySelector("meta[property='og:description']").content
    ).toBe(description)
    expect(
      tags.container.querySelector("meta[property='og:image']").content
    ).toBe('https://unlock-protocol.com/some/image.png')
    expect(
      tags.container.querySelector("meta[property='og:type']").content
    ).toBe('website')
    expect(
      tags.container.querySelector("meta[property='og:url']").content
    ).toBe('https://unlock-protocol.com/lemon')
  })
})
