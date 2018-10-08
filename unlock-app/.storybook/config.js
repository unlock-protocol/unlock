import { configure, addDecorator } from '@storybook/react';
import StoryRouter from 'storybook-react-router';
import '../src/theme/globalStyle'

const req = require.context('../src/stories', true, /\.stories\.js$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

addDecorator(StoryRouter());
configure(loadStories, module);