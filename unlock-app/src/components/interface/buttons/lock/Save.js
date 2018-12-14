import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

export const Save = ({ lock, updateLockPrice, toggleEditing, ...props }) => (
  <Button
    title="Save"
    action={() => {
      console.log('updateLockPrice(${state.something?})')
      toggleEditing()
    }}
    {...props}
  >
    <Svg.Save name="Save" />
  </Button>
)

export default Save
