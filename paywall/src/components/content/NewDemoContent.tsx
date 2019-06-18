import React, { Fragment } from 'react'
import Head from 'next/head'

import DemoComponent from '../interface/Demo'
import { pageTitle } from '../../constants'
import useWindow from '../../hooks/browser/useWindow'
import useConfig from '../../hooks/utils/useConfig'

/**
 * This is the actual demo page with JS which injects a paywall'ed iframe.
 * @param {*} lock
 * @param {*} domain
 */
export default function NewDemoContent() {
  const window = useWindow()
  const { isServer } = useConfig()
  if (isServer) return null
  // use any old URL in case href is a relative path
  const url = new window.URL(
    window.location.href,
    'http://paywall.unlock-protocol.com'
  )
  const locks: string[] = url.searchParams.getAll('lock')
  const names: string[] = url.searchParams.getAll('name')
  const type = url.searchParams.get('type')
  window.unlockProtocolConfig = {
    type: type || 'paywall',
    icon:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDI1NiI+CiAgPHBhdGggZD0iTTQ0OS45Mzk4OCwyMzAuMDUzNzFoNTMuMDRWMGgtNTMuMDRaTTIxNS4xMDIsMTUuOTc2MDdIMTU5LjUwNThWNzEuNTgzODZINzAuNjc5NjNWMTUuOTc2MDdIMTUuMDgzVjcxLjU4Mzg2SDBWOTguMDA0MTVIMTUuMDgzdjQxLjYyNTczYzAsNTIuMDgxNTUsNDUuMDUyMjQsOTQuNTc3NjQsMTAwLjMyOTEsOTQuNTc3NjQsNTQuOTU3LDAsOTkuNjg5OTQtNDIuNDk2MDksOTkuNjg5OTQtOTQuNTc3NjRWOTguMDA0MTVoMTQuOTY0VjcxLjU4Mzg2SDIxNS4xMDJaTTE1OS41MDU4LDEzOS42Mjk4OGMwLDI0LjYwMy0xOS40OTA3Miw0NC43MzI0Mi00NC4wOTM3NSw0NC43MzI0MmE0NC44NjM2Nyw0NC44NjM2NywwLDAsMS00NC43MzI0Mi00NC43MzI0MlY5OC4wMDQxNUgxNTkuNTA1OFpNMzQ4LjY1NjY4LDY3LjA5OTEyYy0xOS4xNzEzOSwwLTM3LjcwMzYyLDguNjI3LTQ4LjI0NzU2LDI0LjI4MzJIMjk5Ljc3bC0zLjE5NDgzLTE5LjgxMDA1aC00Ni42NDk5VjIzMC4wNTM3MWg1My4wNHYtODIuNDM2YzAtMTguMjEyNDEsMTQuMDU5MDgtMzIuOTEwMTYsMzAuOTkzNjUtMzIuOTEwMTYsMTcuNTczMjUsMCwzMS4zMTI1LDE0LjY5Nzc1LDMxLjMxMjUsMzIuMjcxNDh2ODMuMDc0NzFoNTMuMDR2LTg4LjE4N0M0MTguMzExNDYsOTkuNjg5OTQsMzkxLjQ3MjExLDY3LjA5OTEyLDM0OC42NTY2OCw2Ny4wOTkxMlptNjgwLjg3Njk1LDc3LjMyMzI0LDY1LjE4MTY0LTcyLjg1MDA5aC02NS41MDFsLTUxLjEyMyw1OS40MzA2NmgtLjk1OVYwaC01My4wNFYyMzAuMDUzNzFoNTMuMDRWMTU3Ljg0MjI5aC45NTlsNTIuNzIwNyw3Mi4yMTE0Mmg2Ni43NzkzWk02MTMuMjA4NDQsNjcuMDk5MTJjLTQ5LjUyNTQsMC05MC40MjM4MywzNy43MDMxMy05MC40MjM4Myw4My43MTM4N3M0MC44OTg0Myw4My4zOTQ1Myw5MC40MjM4Myw4My4zOTQ1Myw5MC40MjM4Mi0zNy4zODM3OSw5MC40MjM4Mi04My4zOTQ1M1M2NjIuNzMzODMsNjcuMDk5MTIsNjEzLjIwODQ0LDY3LjA5OTEyWm0wLDEyMC43NzgzMmMtMjAuMTI5ODksMC0zNy4wNjQ0Ni0xNi45MzQ1Ny0zNy4wNjQ0Ni0zNy4wNjQ0NXMxNi45MzQ1Ny0zNy4wNjQ0NSwzNy4wNjQ0Ni0zNy4wNjQ0NSwzNy4zODM3OCwxNi45MzQ1NywzNy4zODM3OCwzNy4wNjQ0NVM2MzMuMzM4MzIsMTg3Ljg3NzQ0LDYxMy4yMDg0NCwxODcuODc3NDRaTTgxNC44MTg3OSwxMTMuNDI5MmMxNS42NTYyNSwwLDI4LjQzNzUsOC45NDY3OCwzMy4yMzA0NywyMS40MDc3MWg1My45OThjLTUuNDMxNjQtMzcuMDY0LTQxLjUzNzExLTY3LjczNzc5LTg2LjI2OTUzLTY3LjczNzc5LTQ5Ljg0NTcsMC05MS4wNjM1LDM3LjcwMzEzLTkxLjA2MzUsODMuNzEzODdzNDEuMjE3OCw4My4zOTQ1Myw5MS4wNjM1LDgzLjM5NDUzYzQzLjc3MzQ0LDAsODEuMTU3MjMtMjkuMzk2LDg2LjI2OTUzLTY4LjA1NzYyaC01My45OThjLTUuNzUyLDEzLjEwMDEtMTcuNTc0MjIsMjEuNDA3NzItMzMuMjMwNDcsMjEuNDA3NzJBMzYuOTU1MSwzNi45NTUxLDAsMCwxLDc3OC4wNzQ2NSwxNTAuODEzQzc3OC4wNzQ2NSwxMzAuNjgzMTEsNzk0LjM2OTU3LDExMy40MjkyLDgxNC44MTg3OSwxMTMuNDI5MloiLz4KPC9zdmc+Cg==',
    locks: locks.reduce(
      (allLocks, lockAddress, i) => ({
        ...allLocks,
        [lockAddress]: { name: names[i] || 'A Lock' },
      }),
      {}
    ),
    callToAction: {
      default:
        'You have reached your limit of free articles. Please purchase access to continue reading',
    },
  }
  return (
    <Fragment>
      <Head>
        <title>{pageTitle('Demo')}</title>
        <script src="/static/unlock.1.0.min.js" />
      </Head>
      <DemoComponent />
    </Fragment>
  )
}
