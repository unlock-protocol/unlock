import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Verifiers = (props: any) => (
  <Button label="Verifiers" {...props}>
    <Svg.Members name="Claim NFT" />
  </Button>
)

export default Verifiers
