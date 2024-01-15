import {
  EventPageProps,
  ServerSidePropsParams,
  getServerSidePropsForEventPage,
} from '.'

export const getServerSideProps = async ({ params }: ServerSidePropsParams) => {
  return getServerSidePropsForEventPage(params.slug)
}
const Settings = (props: EventPageProps) => {
  console.log(props)
  return <p>Settings</p>
}

export default Settings
