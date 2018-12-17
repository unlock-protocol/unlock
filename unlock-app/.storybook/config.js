import React from 'react'
import { configure, addDecorator } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import GlobalStyle from '../src/theme/globalStyle'
import Fonts from '../src/theme/Fonts'

const req = require.context('../src/stories', true, /\.stories\.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

const GlobalStyleDecorator = storyFn => (
  <React.Fragment>
    <Fonts />
    <GlobalStyle />
    {storyFn()}
  </React.Fragment>
)

addDecorator(GlobalStyleDecorator)
addDecorator(StoryRouter())
configure(loadStories, module)
