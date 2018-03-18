import React from 'react'

const Lock = (props) => {
  return (<li>
    {props.lock.address}
  </li>)
}

const Locks = (props) => {
  return (<ul>
    {props.locks.map((lock, idx) => {
      return (<Lock lock={lock} key={idx} />)
    })}
  </ul>)
}

export default Locks
