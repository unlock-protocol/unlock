import startupWhenReady from './startup'
import '../static/iframe.css'

declare let __ENVIRONMENT_VARIABLES__: any

startupWhenReady(window, __ENVIRONMENT_VARIABLES__)
