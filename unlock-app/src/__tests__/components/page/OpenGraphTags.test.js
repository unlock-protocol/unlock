import React from 'react'
import { shallow } from 'enzyme'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
  CANONICAL_BASE_URL,
} from '../../../constants'
import OpenGraphTags from '../../../components/page/OpenGraphTags'

describe('OpenGraphTags', () => {
  it('should render open graph tags based on default values', () => {
    const tags = shallow(<OpenGraphTags />)
    expect(tags.find('meta[property=\'og:title\']').props().content).toBe(
      pageTitle()
    )
    expect(tags.find('meta[property=\'og:description\']').props().content).toBe(
      PAGE_DESCRIPTION
    )
    expect(tags.find('meta[property=\'og:image\']').props().content).toBe(
      PAGE_DEFAULT_IMAGE
    )
    expect(tags.find('meta[property=\'og:type\']').props().content).toBe(
      'website'
    )
    expect(tags.find('meta[property=\'og:url\']').props().content).toBe(
      CANONICAL_BASE_URL + '/'
    )
  })

  it('should render open graph tags based on custom values', () => {
    let title = 'custom title'
    let description = 'I am the very model of a model view controller'
    let image = '/some/image.png'
    let path = '/lemon'
    const tags = shallow(
      <OpenGraphTags
        title={title}
        description={description}
        image={image}
        canonicalPath={path}
      />
    )
    expect(tags.find('meta[property=\'og:title\']').props().content).toBe(title)
    expect(tags.find('meta[property=\'og:description\']').props().content).toBe(
      description
    )
    expect(tags.find('meta[property=\'og:image\']').props().content).toBe(image)
    expect(tags.find('meta[property=\'og:type\']').props().content).toBe(
      'website'
    )
    expect(tags.find('meta[property=\'og:url\']').props().content).toBe(
      CANONICAL_BASE_URL + path
    )
  })
})
