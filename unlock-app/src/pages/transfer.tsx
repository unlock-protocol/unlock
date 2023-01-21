import { NextPage } from 'next'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Transfer } from '~/components/interface/transfer'

const TransferPage: NextPage = () => {
  return (
    <AppLayout>
      <Transfer />
    </AppLayout>
  )
}

export default TransferPage
