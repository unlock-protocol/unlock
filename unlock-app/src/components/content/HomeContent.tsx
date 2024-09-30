import { useEffect } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import { AppLayout } from '../interface/layouts/AppLayout'
import { useRouter } from 'next/navigation'
import { useAuth } from '~/contexts/AuthenticationContext'
import Loading from '../interface/Loading'
import { Launcher } from '../interface/Launcher'
import { useSession } from '~/hooks/useSession'

export const HomeContent = () => {
  const { isLoading } = useSession()
  const router = useRouter()
  const { account } = useAuth()

  useEffect(() => {
    if (account) {
      router.push('/locks')
    }
  }, [account, router])

  return (
    <AppLayout authRequired={false} showLinks={false}>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>
      {account && <Loading />}
      {!account && !isLoading && <Launcher />}
    </AppLayout>
  )
}
