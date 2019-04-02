import React, { useRef, useEffect, useReducer, useCallback } from 'react'
import PropTypes from 'prop-types'

import useWindow from '../hooks/browser/useWindow'
import { SHOW_FLAG_FOR } from '../constants'

export default function FakeIframe({ children, hide }) {
  const divit = useRef()
  const [{ styles, isPhone }, dispatch] = useReducer(
    (state, isPhone) => {
      if (isPhone) {
        return {
          styles: {
            position: 'fixed',
            display: 'flex',
            bottom: 0,
            width: '100vw',
            height: '80px',
          },
          isPhone,
        }
      }
      return {
        styles: {
          position: 'fixed',
          right: 0,
          bottom: '105px',
          width: '134px',
          height: '160px',
          marginRight: 0,
          transition: 'margin-right 0.4s ease-in',
        },
        isPhone,
      }
    },
    { styles: {}, isPhone: false }
  )
  const enter = useCallback(() => {
    if (isPhone || !hide) return
    divit.current.style.marginRight = 0
  }, [isPhone, hide])
  const leave = useCallback(() => {
    if (isPhone || !hide) return
    divit.current.style.marginRight = '-104px'
  }, [isPhone, hide])
  const window = useWindow()
  const resizeListener = mql => {
    dispatch(mql.matches)
  }
  useEffect(() => {
    const queryList = window.matchMedia('(max-width: 736px)')
    queryList.addListener(resizeListener)
    dispatch(queryList.matches)
    let timeout = setTimeout(() => {
      leave()
    }, SHOW_FLAG_FOR)

    return () => {
      queryList.removeListener(resizeListener)
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])
  return (
    <div
      ref={divit}
      style={styles}
      onMouseEnter={() => enter()}
      onMouseLeave={() => leave()}
    >
      {children}
    </div>
  )
}

FakeIframe.propTypes = {
  children: PropTypes.node.isRequired,
  hide: PropTypes.bool.isRequired,
}
