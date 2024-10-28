import { Container } from '~/components/interface/Container'
import DashboardHeader from '~/components/interface/layouts/index/DashboardHeader'
import LoadingIcon from '~/components/interface/Loading'

const LoadingFallback = () => {
  return (
    <div className="pointer-events-none">
      <Container>
        <DashboardHeader showMenu={false} />
        <div className="flex flex-col gap-10 min-h-screen">
          <LoadingIcon />
        </div>
      </Container>
    </div>
  )
}

export default LoadingFallback
