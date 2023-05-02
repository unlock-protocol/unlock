import React from 'react'
import Link from 'next/link'

export const InvalidLink = () => (
  <div>
    <h1 className="mb-2 text-3xl font-bold">Sign Up</h1>
    <p className="text-xl text-gray-500">
      The link you used is invalid. Please try again.{' '}
      <Link href="/signup">Sign up</Link>.
    </p>
  </div>
)

export default InvalidLink
