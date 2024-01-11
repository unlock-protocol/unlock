import { EventPageProps } from '.'
import { getServerSidePropsForEventPage } from './shared'

export const getServerSideProps = getServerSidePropsForEventPage

const Attendees = (props: EventPageProps) => {
  console.log(props)
  return <p>Attendees</p>
}

export default Attendees
