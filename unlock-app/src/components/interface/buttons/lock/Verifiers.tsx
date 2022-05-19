import React from 'react'
import { GrUserAdmin as UserAdmin } from 'react-icons/gr'
import Button from '../Button'

const Verifiers = (props: any) => (
  <Button label="Verifiers" {...props}>
    <UserAdmin
      style={{ height: '15px', stroke: 'var(--gray)' }}
      className="text-gray-400"
    />
  </Button>
)

export default Verifiers
