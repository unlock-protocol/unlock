import React from 'react'
import { storiesOf } from '@storybook/react'
import DatePicker from '../../components/interface/DatePicker'

const now = new Date(2019, 3, 18, 6, 35, 34)
const onChange = () => {}

storiesOf('DatePicker', module).add('the DatePicke', () => {
  return <DatePicker now={now} onChange={onChange} />
})
