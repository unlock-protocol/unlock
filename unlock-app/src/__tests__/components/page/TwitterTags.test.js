import React from 'react'
import { shallow } from 'enzyme'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
} from '../../../constants'
import TwitterTags from '../../../components/page/TwitterTags'

describe('TwitterTags', () => {
  it('should render twitter tags based on default values', () => {
    const tags = shallow(<TwitterTags />)
    expect(tags.find('meta[name=\'twitter:title\']').props().content).toBe(
      pageTitle()
    )
    expect(tags.find('meta[name=\'twitter:description\']').props().content).toBe(
      PAGE_DESCRIPTION
    )
    expect(tags.find('meta[name=\'twitter:image\']').props().content).toBe(
      PAGE_DEFAULT_IMAGE
    )
  })

  it('should render twitter tags based on custom values', () => {
    let title = 'custom title'
    let description = 'I am the very model of a model view controller'
    let image = '/some/image.png'
    const tags = shallow(
      <TwitterTags title={title} description={description} image={image} />
    )
    expect(tags.find('meta[name=\'twitter:title\']').props().content).toBe(title)
    expect(tags.find('meta[name=\'twitter:description\']').props().content).toBe(
      description
    )
    expect(tags.find('meta[name=\'twitter:image\']').props().content).toBe(image)
  })
})
