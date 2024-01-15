import Attendees from '~/components/content/event/attendees/Attendees'
import {
  EventPageProps,
  ServerSidePropsParams,
  getServerSidePropsForEventPage,
} from '.'

export const getServerSideProps = async ({ params }: ServerSidePropsParams) => {
  return getServerSidePropsForEventPage(params.slug)
}

const AttendeesPage = (props: EventPageProps) => {
  return <Attendees {...props.pageProps} />
}

export default AttendeesPage
