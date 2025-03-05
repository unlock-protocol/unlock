'use client'

import { useAuthenticate } from '~/hooks/useAuthenticate'
import { addressMinify } from '~/utils/strings'

const NotManagerBanner = () => {
  const { account } = useAuthenticate()

  return (
    <div className="p-2 text-base text-center text-red-700 bg-red-100 border border-red-700 rounded-xl">
      You are connected as {addressMinify(account!)} and this address is not a
      manager for this lock. If you want to update details, please connect as
      lock manager.
    </div>
  )
}

export default NotManagerBanner
