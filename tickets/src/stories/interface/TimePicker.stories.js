import React from 'react'
import { storiesOf } from '@storybook/react'
import TimePicker from '../../components/interface/TimePicker'

const date = new Date(2019, 3, 18, 6, 35, 34)
const onChange = () => {}

storiesOf('TimePicker', module).add('the TimePicker', () => {
  return <TimePicker date={date} onChange={onChange} />
})
