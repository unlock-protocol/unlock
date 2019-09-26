import React from 'react'
import { storiesOf } from '@storybook/react'
import DatePicker from '../../components/interface/DatePicker'

const now = new Date(2019, 3, 18, 6, 35, 34)
const date = new Date(2019, 8, 1, 12, 0, 0)
const onChange = () => {}

storiesOf('DatePicker', module).add('the DatePicke', () => {
  return <DatePicker now={now} date={date} onChange={onChange} />
})
