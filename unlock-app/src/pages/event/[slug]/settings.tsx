import { EventSettings } from '~/components/content/event/Settings/EventSettings'
import {
  EventPageProps,
  ServerSidePropsParams,
  getServerSidePropsForEventPage,
} from '.'

export const getServerSideProps = async ({ params }: ServerSidePropsParams) => {
  return getServerSidePropsForEventPage(params.slug)
}

const Settings = ({ pageProps: { event, checkoutConfig } }: EventPageProps) => {
  // we pass the slug to make sure we reload the settings as an authenticated user
  return <EventSettings slug={event.slug} checkoutConfig={checkoutConfig} />
}

export default Settings
