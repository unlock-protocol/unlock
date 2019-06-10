import React from 'react'
import { storiesOf } from '@storybook/react'
import {
  Grid,
  GridFull,
  GridHalf,
  GridThird,
} from '../../components/helpers/Grid'

const style = {
  height: '100px',
  backgroundColor: 'var(--lightred)',
}

storiesOf('Grid system', module)
  .addDecorator(getStory => <Grid>{getStory()}</Grid>)
  .add('The base grid', () => {
    return [...Array(12).keys()].map(n => <div key={'div' + n} style={style} />)
  })
  .add('GridFull span', () => {
    return <GridFull style={style} />
  })
  .add('GridHalf span', () => {
    return (
      <React.Fragment>
        <GridHalf style={style} />
        <GridHalf style={style} />
      </React.Fragment>
    )
  })
  .add('GridThird span', () => {
    return (
      <React.Fragment>
        <GridThird style={style} />
        <GridThird style={style} />
        <GridThird style={style} />
      </React.Fragment>
    )
  })
