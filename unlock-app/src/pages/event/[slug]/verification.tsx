import {
  EventPageProps,
  ServerSidePropsParams,
  getServerSidePropsForEventPage,
} from '.'
import EventVerification from '~/components/content/event/EventVerification'

export const getServerSideProps = async ({ params }: ServerSidePropsParams) => {
  return getServerSidePropsForEventPage(params.slug)
}

const AttendeesPage = ({
  pageProps: { event, checkoutConfig },
}: EventPageProps) => {
  return <EventVerification slug={event.slug} checkoutConfig={checkoutConfig} />
}

export default AttendeesPage
