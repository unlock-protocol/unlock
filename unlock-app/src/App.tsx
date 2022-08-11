import {
  ReactLocation,
  Router,
  createBrowserHistory,
  Outlet,
} from '@tanstack/react-location'
import GlobalWrapper from './components/interface/GlobalWrapper'
import Dashboard from './pages/dashboard'
import { QueryClient, QueryClientProvider } from 'react-query'
const history = createBrowserHistory()
import './index.css'
const location = new ReactLocation({
  history,
})
const queryClient = new QueryClient()

export const App = () => {
  return (
    <GlobalWrapper>
      <QueryClientProvider client={queryClient}>
        <Router
          location={location}
          routes={[
            {
              path: '/dashboard',
              element: <Dashboard />,
            },
          ]}
        >
          <Outlet />
        </Router>
      </QueryClientProvider>
    </GlobalWrapper>
  )
}
