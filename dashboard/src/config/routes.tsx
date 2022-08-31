import {
  Route,
  ReactLocation,
  createBrowserHistory,
} from '@tanstack/react-location'

export const routes: Route[] = [
  {
    path: '/',
  },
]

const history = createBrowserHistory()

export const location = new ReactLocation({
  history,
})
