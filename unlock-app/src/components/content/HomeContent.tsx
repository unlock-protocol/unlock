'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '../interface/Loading'
import { Launcher } from '../interface/Launcher'
import { useSession } from '~/hooks/useSession'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { Container } from '../interface/Container'
import DashboardHeader from '../interface/layouts/index/DashboardHeader'
import { ConnectModal } from '../interface/connect/ConnectModal'

export const HomeContent = () => {
  const { isLoading } = useSession()
  const router = useRouter()
  const { account } = useAuthenticate()

  useEffect(() => {
    if (account) {
      router.push('/locks')
    }
  }, [account, router])

  return (
    <Container>
      <ConnectModal />
      <DashboardHeader />
      {account && <Loading />}
      {!account && !isLoading && <Launcher />}
    </Container>
  )
}
