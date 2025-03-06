'use client'

import { Launcher } from '../interface/Launcher'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import LocksContent from './lock/LocksContent'

export const HomeContent = () => {
  const { account } = useAuthenticate()

  return (
    <>
      {account && (
        <div className="flex flex-col gap-4">
          <LocksContent />
        </div>
      )}
      {!account && <Launcher />}
    </>
  )
}
