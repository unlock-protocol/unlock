import { EventPageProps } from '.'
import { getServerSidePropsForEventPage } from './shared'

export const getServerSideProps = getServerSidePropsForEventPage

const Settings = (props: EventPageProps) => {
  console.log(props)
  return <p>Settings</p>
}

export default Settings
