import { makeIframe } from './iframeManager'
import setupPostOffices from './setupPostOffices'

const dataIframe = makeIframe(window, '/static/dataIframe.html')
const checkoutIframe = makeIframe(window, '/checkout')

setupPostOffices(window, dataIframe, checkoutIframe)
