import React from 'react'
import Link from 'next/link'
import { CallToAction } from '../Components'

const Signature = () => (
  <CallToAction>
    Check out our open source code on{' '}
    <a href="https://github.com/unlock-protocol/unlock">GitHub</a>, come work{' '}
    <Link href="/jobs">with us</Link> or simply{' '}
    <a href="mailto:hello@unlock-protocol.com">get in touch</a>.
  </CallToAction>
)

export default Signature
