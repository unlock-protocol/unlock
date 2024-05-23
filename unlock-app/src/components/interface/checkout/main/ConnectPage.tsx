import React, { Fragment } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { SelectConnectMethod } from '../../connect/SelectConnectMethod'

interface ConnectPageProps {
  style: string
  connected: string | undefined
  onNext?: () => void
}

export const ConnectPage = ({ style, connected, onNext }: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        <SelectConnectMethod connected={connected} onNext={onNext} />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
