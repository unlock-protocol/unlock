import { EventSettings } from '~/components/content/event/Settings/EventSettings'
import {
  EventPageProps,
  ServerSidePropsParams,
  getServerSidePropsForEventPage,
} from '.'

export const getServerSideProps = async ({ params }: ServerSidePropsParams) => {
  return getServerSidePropsForEventPage(params.slug)
}

const Settings = (props: EventPageProps) => {
  return <EventSettings {...props.pageProps} />
}

export default Settings
